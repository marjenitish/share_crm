'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

import { Customer } from '../../../../supabase/types';
export default function CustomerDetailsPage() {
  const { customerId } = useParams<{ customerId: string }>();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createBrowserClient();

  useEffect(() => {
    if (!customerId) {
      setError('Customer ID is missing.');
      setLoading(false);
      return;
    }

    const fetchCustomer = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase.from('customers')
          .select('*')
          .eq('id', customerId)
          .single();

        if (error) {
          throw error;
        }

        if (data) {
          setCustomer(data);
        } else {
          setError('Customer not found.');
        }
      } catch (err: any) {
        console.error('Error fetching customer:', err);
        setError(err.message || 'Failed to fetch customer details.');
      } finally {
        setLoading(false);
      }
    };

    fetchCustomer();
  }, [customerId, supabase]);

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle>Loading Customer Details...</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-6 w-2/3" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-destructive">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle>Customer Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p>The requested customer could not be found.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatBoolean = (value: boolean | null | undefined) => {
    if (value === undefined || value === null) return 'N/A';
    return value ? 'Yes' : 'No';
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (error) {
      console.error('Error formatting date:', dateString, error);
      return 'Invalid Date';
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>{customer.surname}, {customer.first_name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-medium">Basic Information</h3>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-1">Contact</h4>
                <p className="text-muted-foreground">{customer.contact_no || 'N/A'}</p>
                <p className="text-muted-foreground">{customer.email || 'N/A'}</p>
              </div>
              <div>
                <h4 className="font-medium mb-1">Work Mobile</h4>
                <p className="text-muted-foreground">{customer.work_mobile || 'N/A'}</p>
              </div>
              <div className="md:col-span-2">
                <h4 className="font-medium mb-1">Address</h4>
                <p className="text-muted-foreground">
                  {customer.street_number} {customer.street_name}
                  {(customer.street_number || customer.street_name) && <br />}
                  {customer.suburb}
                  {(customer.suburb && customer.post_code) && ', '}
                  {customer.post_code}
                  {!(customer.street_number || customer.street_name || customer.suburb || customer.post_code) && 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Personal Details */}
          <div>
            <h3 className="text-lg font-medium">Personal Details</h3>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-1">Date of Birth</h4>
                <p className="text-muted-foreground">{formatDate(customer.date_of_birth)}</p>
              </div>
              <div>
                <h4 className="font-medium mb-1">Country of Birth</h4>
                <p className="text-muted-foreground">{customer.country_of_birth || 'N/A'}</p>
              </div>
              <div>
                <h4 className="font-medium mb-1">Language Other Than English</h4>
                <p className="text-muted-foreground">{customer.language_other_than_english || 'N/A'}</p>
              </div>
              <div>
                <h4 className="font-medium mb-1">English Proficiency</h4>
                <p className="text-muted-foreground">{customer.english_proficiency || 'N/A'}</p>
              </div>
              <div>
                <h4 className="font-medium mb-1">Indigenous Status</h4>
                <p className="text-muted-foreground">{customer.indigenous_status || 'N/A'}</p>
              </div>
              <div>
                <h4 className="font-medium mb-1">Australian Citizen or Resident</h4>
                <p className="text-muted-foreground">{formatBoolean(customer.australian_citizen)}</p>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div>
            <h3 className="text-lg font-medium">Additional Information</h3>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-1">Occupation</h4>
                <p className="text-muted-foreground">{customer.occupation || 'N/A'}</p>
              </div>
              <div>
                <h4 className="font-medium mb-1">Reason for Class</h4>
                <p className="text-muted-foreground">{customer.reason_for_class || 'N/A'}</p>
              </div>
              <div className="md:col-span-2">
                <h4 className="font-medium mb-1">How Did You Hear About Us</h4>
                <p className="text-muted-foreground">{customer.how_did_you_hear || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Next of Kin */}
          <div>
            <h3 className="text-lg font-medium">Next of Kin</h3>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-1">Name</h4>
                <p className="text-muted-foreground">{customer.next_of_kin_name || 'N/A'}</p>
              </div>
              <div>
                <h4 className="font-medium mb-1">Relationship</h4>
                <p className="text-muted-foreground">{customer.next_of_kin_relationship || 'N/A'}</p>
              </div>
              <div>
                <h4 className="font-medium mb-1">Mobile</h4>
                <p className="text-muted-foreground">{customer.next_of_kin_mobile || 'N/A'}</p>
              </div>
              <div>
                <h4 className="font-medium mb-1">Phone</h4>
                <p className="text-muted-foreground">{customer.next_of_kin_phone || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Equipment Purchased */}
          <div>
            <h3 className="text-lg font-medium">Equipment Purchased</h3>
            <div className="mt-4">
              <p className="text-muted-foreground">
                {customer.equipment_purchased && customer.equipment_purchased.length > 0
                  ? customer.equipment_purchased.join(', ')
                  : 'N/A'}
              </p>
            </div>
          </div>

          {/* Status */}
          <div>
            <h3 className="text-lg font-medium">Status</h3>
            <div className="mt-4">
              <Badge variant={customer.status === 'Active' ? 'default' : 'secondary'}>
                {customer.status || 'N/A'}
              </Badge>
            </div>
          </div>

          {/* Timestamps */}
          <div className="text-sm text-muted-foreground">
            <p><strong>Created At:</strong> {customer.created_at ? new Date(customer.created_at).toLocaleString() : 'N/A'}</p>
            <p><strong>Updated At:</strong> {customer.updated_at ? new Date(customer.updated_at).toLocaleString() : 'N/A'}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}