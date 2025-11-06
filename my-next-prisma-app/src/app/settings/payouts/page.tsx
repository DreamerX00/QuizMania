"use client";

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import { toast } from 'react-hot-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle, Loader2, DollarSign, AlertCircle } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function PayoutSettingsPage() {
  const { status } = useSession();
  const isLoaded = status !== 'loading';
  const isSignedIn = status === 'authenticated';
  const router = useRouter();
  const [upiId, setUpiId] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { data, error, mutate } = useSWR('/api/payout-account', fetcher);

  if (!isLoaded) {
    return <div className="flex justify-center items-center min-h-screen">Loading authentication status...</div>;
  }
  if (!isSignedIn) {
    router.push('/sign-in');
    return null;
  }

  const handleOnboard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!upiId) {
      toast.error('Please enter a valid UPI ID.');
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch('/api/payout-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ upiId }),
      });
      const result = await response.json();
      if (response.ok) {
        toast.success('Payout account linked successfully!');
        mutate(); // Re-fetch payout account data
        setUpiId('');
      } else {
        throw new Error(result.error || 'Failed to link account.');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      toast.error(`Error: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const renderContent = () => {
    if (error) {
      return (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Failed to load your payout information. Please try again later.</AlertDescription>
        </Alert>
      );
    }

    if (!data) {
      return (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      );
    }

    if (data.hasAccount) {
      return (
        <Alert variant="default" className="bg-green-50 border-green-200">
           <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">Payout Account Linked!</AlertTitle>
          <AlertDescription>
            <p>Your payouts are active. Earnings from your quiz sales will be automatically transferred.</p>
            <div className="mt-2 text-sm text-gray-600">
              <strong>Type:</strong> {data.account.accountType.toUpperCase()} <br />
              <strong>UPI ID:</strong> {data.account.accountDetails.upiId} <br />
              <strong>Linked On:</strong> {new Date(data.account.createdAt).toLocaleDateString()}
            </div>
          </AlertDescription>
        </Alert>
      );
    }

    return (
      <form onSubmit={handleOnboard}>
        <p className="mb-4 text-sm text-gray-600">
          Link your UPI account to receive payments automatically when users purchase your quizzes. We use Razorpay Route for secure and automated transfers.
        </p>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="upiId">Your UPI ID</Label>
            <Input
              id="upiId"
              type="text"
              placeholder="yourname@bank"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Linking...
              </>
            ) : (
              'Link Payout Account'
            )}
          </Button>
        </div>
      </form>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign />
              Payout Settings
            </CardTitle>
            <CardDescription>
              Manage how you receive earnings from your quiz sales.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {renderContent()}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 