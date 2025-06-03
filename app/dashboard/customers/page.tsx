'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CustomersTable } from '@/components/customers/customers-table';
import { CustomerModal } from '@/components/customers/customer-modal';
import { CustomerDetails } from '@/components/customers/customer-details';
import { MarketingModal } from '@/components/customers/marketing-modal';
import { useToast } from '@/hooks/use-toast';
import { createBrowserClient } from '@/lib/supabase/client';

export default function CustomersPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isMarketingModalOpen, setIsMarketingModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const { toast } = useToast();
  
  const supabase = createBrowserClient();

  const handleEdit = (customer: any) => {
    setSelectedCustomer(customer);
    setIsModalOpen(true);
  };

  const handleView = (customer: any) => {
    setSelectedCustomer(customer);
    setIsDetailsOpen(true);
  };

  const handleCreate = () => {
    setSelectedCustomer(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (data: any) => {
    try {
      if (selectedCustomer) {
        // Update existing customer
        const { error } = await supabase
          .from('customers')
          .update({
            surname: data.surname,
            first_name: data.firstName,
            street_number: data.streetNumber,
            street_name: data.streetName,
            suburb: data.suburb,
            post_code: data.postCode,
            contact_no: data.contactNo,
            email: data.email,
            country_of_birth: data.countryOfBirth,
            date_of_birth: data.dateOfBirth,
            work_mobile: data.workMobile,
            paq_form: data.paqForm,
            australian_citizen: data.australianCitizen,
            language_other_than_english: data.languageOtherThanEnglish,
            english_proficiency: data.englishProficiency,
            indigenous_status: data.indigenousStatus,
            reason_for_class: data.reasonForClass,
            how_did_you_hear: data.howDidYouHear,
            occupation: data.occupation,
            next_of_kin_name: data.nextOfKinName,
            next_of_kin_relationship: data.nextOfKinRelationship,
            next_of_kin_mobile: data.nextOfKinMobile,
            next_of_kin_phone: data.nextOfKinPhone,
            equipment_purchased: data.equipmentPurchased,
            status: data.status,
            updated_at: new Date().toISOString(),
          })
          .eq('id', selectedCustomer.id);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Customer updated successfully',
        });
      } else {
        // Create new customer
        const { error } = await supabase.from('customers').insert([{
          surname: data.surname,
          first_name: data.firstName,
          street_number: data.streetNumber,
          street_name: data.streetName,
          suburb: data.suburb,
          post_code: data.postCode,
          contact_no: data.contactNo,
          email: data.email,
          country_of_birth: data.countryOfBirth,
          date_of_birth: data.dateOfBirth,
          work_mobile: data.workMobile,
          paq_form: data.paqForm,
          australian_citizen: data.australianCitizen,
          language_other_than_english: data.languageOtherThanEnglish,
          english_proficiency: data.englishProficiency,
          indigenous_status: data.indigenousStatus,
          reason_for_class: data.reasonForClass,
          how_did_you_hear: data.howDidYouHear,
          occupation: data.occupation,
          next_of_kin_name: data.nextOfKinName,
          next_of_kin_relationship: data.nextOfKinRelationship,
          next_of_kin_mobile: data.nextOfKinMobile,
          next_of_kin_phone: data.nextOfKinPhone,
          equipment_purchased: data.equipmentPurchased,
          status: data.status,
        }]);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Customer created successfully',
        });
      }

      setIsModalOpen(false);
      setRefreshKey(prev => prev + 1);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleSendMarketing = async (message: string) => {
    try {
      // In a real application, you would send this to your email service
      // For now, we'll just show a success message
      toast({
        title: 'Success',
        description: `Marketing email sent to ${selectedCustomers.length} customers`,
      });
      setIsMarketingModalOpen(false);
      setSelectedCustomers([]);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setIsMarketingModalOpen(true)}
            disabled={selectedCustomers.length === 0}
          >
            Send Marketing Email
          </Button>
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Add Customer
          </Button>
        </div>
      </div>

      <CustomersTable
        onEdit={handleEdit}
        onView={handleView}
        refreshKey={refreshKey}
        selectedCustomers={selectedCustomers}
        onSelectedCustomersChange={setSelectedCustomers}
      />

      <CustomerModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        customer={selectedCustomer}
        onSubmit={handleSubmit}
      />

      <CustomerDetails
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        customer={selectedCustomer}
      />

      <MarketingModal
        open={isMarketingModalOpen}
        onOpenChange={setIsMarketingModalOpen}
        onSubmit={handleSendMarketing}
        selectedCount={selectedCustomers.length}
      />
    </div>
  );
}