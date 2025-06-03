'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { createBrowserClient } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { PaymentModal } from './payment-modal';
import { PaymentList } from './payment-list';
import { Badge } from '@/components/ui/badge';
import { jsPDF } from 'jspdf';

interface BookingDetailsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking: any;
  onEdit: () => void;
}

export function BookingDetailsSheet({
  open,
  onOpenChange,
  booking,
  onEdit,
}: BookingDetailsSheetProps) {
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const { toast } = useToast();

  if (!booking) return null;
  
  const supabase = createBrowserClient();

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', booking.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Booking deleted successfully',
      });
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleAddPayment = async (data: any) => {
    try {
      const { error } = await supabase.from('payments').insert([{
        booking_id: booking.id,
        amount: data.amount,
        payment_method: data.paymentMethod,
        payment_status: 'completed',
        transaction_id: data.transactionId,
        payment_date: data.paymentDate,
        notes: data.notes,
        receipt_number: await generateReceiptNumber(),
      }]);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Payment added successfully',
      });
      setIsPaymentModalOpen(false);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const generateReceiptNumber = async () => {
    const { data, error } = await supabase
      .rpc('generate_receipt_number');
    
    if (error) throw error;
    return data;
  };

  const handleDownloadReceipt = (payment: any) => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Set font
    doc.setFont('helvetica');
    
    // Header
    doc.setFontSize(24);
    doc.text('SHARE CRM', 20, 20);
    
    // Receipt details
    doc.setFontSize(14);
    doc.text(`Receipt #${payment.receipt_number}`, 20, 35);
    doc.text(format(new Date(payment.payment_date), 'dd.MM.yyyy HH:mm'), 140, 35);
    
    // Divider
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 45, 190, 45);
    
    // Customer Details
    doc.setFontSize(12);
    doc.text('Customer:', 20, 60);
    doc.setTextColor(100, 100, 100);
    doc.text(`${booking.customers?.surname}, ${booking.customers?.first_name}`, 20, 67);
    doc.text(booking.customers?.email || '', 20, 74);
    doc.text(booking.customers?.contact_no || '', 20, 81);
    
    // Class Details
    doc.setTextColor(0, 0, 0);
    doc.text('Class Details:', 20, 100);
    doc.setTextColor(100, 100, 100);
    doc.text(`Class: ${booking.classes?.name}`, 20, 107);
    doc.text(`Instructor: ${booking.classes?.instructors?.name}`, 20, 114);
    doc.text(`Term: ${booking.term}`, 20, 121);
    doc.text(`Venue: ${booking.classes?.venue}`, 20, 128);
    
    // Payment Details
    doc.setTextColor(0, 0, 0);
    doc.text('Payment Details:', 20, 147);
    doc.setTextColor(100, 100, 100);
    
    // Create a table for payment details
    const paymentDetails = [
      ['Amount:', `$${payment.amount.toFixed(2)}`],
      ['Payment Method:', payment.payment_method.toUpperCase()],
      ['Status:', payment.payment_status.toUpperCase()],
      ['Transaction ID:', payment.transaction_id || 'N/A']
    ];
    
    let yPos = 154;
    paymentDetails.forEach(([label, value]) => {
      doc.text(label, 20, yPos);
      doc.text(value, 70, yPos);
      yPos += 7;
    });
    
    // Notes
    if (payment.notes) {
      doc.setTextColor(0, 0, 0);
      doc.text('Notes:', 20, yPos + 10);
      doc.setTextColor(100, 100, 100);
      doc.text(payment.notes, 20, yPos + 17);
    }
    
    // Footer
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.text('Thank you for choosing SHARE CRM!', 20, 270);
    
    // QR Code placeholder (you can add actual QR code implementation if needed)
    doc.rect(140, 240, 30, 30);
    
    // Company Details
    doc.setTextColor(100, 100, 100);
    doc.text('SHARE CRM', 20, 280);
    doc.text('123 Exercise Street, Fitness VIC 3000', 20, 285);
    doc.text('support@sharecrm.com | 1800 XXX XXX', 20, 290);
    
    // Save PDF
    doc.save(`receipt-${payment.receipt_number}.pdf`);
  };

  const totalAmount = booking.classes?.fee_amount || 0;
  const totalPaid = booking.payments?.reduce((sum: number, payment: any) => 
    sum + (payment.payment_status === 'completed' ? payment.amount : 0), 0) || 0;
  const remainingAmount = totalAmount - totalPaid;

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-[500px] sm:w-[540px]">
          <SheetHeader>
            <SheetTitle>Booking Details</SheetTitle>
          </SheetHeader>
          
          <Tabs defaultValue="details" className="mt-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="payments" disabled={booking.is_free_trial}>Payments</TabsTrigger>
            </TabsList>
            
            <TabsContent value="details" className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">Class</h3>
                <p className="text-lg font-medium">{booking.classes?.name}</p>
                <p className="text-sm text-muted-foreground">
                  {booking.classes?.time} • {booking.classes?.venue}
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">Customer</h3>
                <p className="text-lg font-medium">
                  {booking.customers?.surname}, {booking.customers?.first_name}
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">Instructor</h3>
                <p className="text-lg font-medium">{booking.classes?.instructors?.name}</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">Term</h3>
                <p className="text-lg font-medium">{booking.term}</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">Type</h3>
                <Badge variant={booking.is_free_trial ? "secondary" : "default"}>
                  {booking.is_free_trial ? "Free Trial" : "Regular Class"}
                </Badge>
              </div>

              <div className="flex gap-2">
                <Button className="flex-1" onClick={onEdit}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </Button>
                <Button variant="destructive" className="flex-1" onClick={handleDelete}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </div>
            </TabsContent>
            
            {!booking.is_free_trial && (
              <TabsContent value="payments" className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Payment Status</p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-lg font-medium">
                        ${totalPaid.toFixed(2)} / ${totalAmount.toFixed(2)}
                      </span>
                      {remainingAmount > 0 && (
                        <span className="text-sm text-muted-foreground">
                          (${remainingAmount.toFixed(2)} remaining)
                        </span>
                      )}
                    </div>
                  </div>
                  <Button onClick={() => setIsPaymentModalOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Payment
                  </Button>
                </div>

                <PaymentList 
                  payments={booking.payments} 
                  onDownloadReceipt={handleDownloadReceipt}
                />
              </TabsContent>
            )}
          </Tabs>
        </SheetContent>
      </Sheet>
      
      {!booking.is_free_trial && (
        <PaymentModal
          open={isPaymentModalOpen}
          onOpenChange={setIsPaymentModalOpen}
          onSubmit={handleAddPayment}
          remainingAmount={remainingAmount}
        />
      )}
    </>
  );
}