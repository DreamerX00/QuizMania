'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trash2, Shield, Download, Eye, AlertTriangle, CheckCircle } from 'lucide-react';

interface DataCategory {
  id: string;
  name: string;
  description: string;
  size: string;
  lastUpdated: Date;
  canDelete: boolean;
  canDownload: boolean;
}

interface DeletionRequest {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  requestedAt: Date;
  completedAt?: Date;
  categories: string[];
}

export default function PrivacyPage() {
  const { data: session } = useSession();
  const user = session?.user;
  const [dataCategories, setDataCategories] = useState<DataCategory[]>([]);
  const [deletionRequests, setDeletionRequests] = useState<DeletionRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch user's data categories
      const response = await fetch('/api/user/data-categories');
      if (response.ok) {
        const categories = await response.json();
        setDataCategories(categories);
      }

      // Fetch deletion requests
      const requestsResponse = await fetch('/api/user/deletion-requests');
      if (requestsResponse.ok) {
        const requests = await requestsResponse.json();
        setDeletionRequests(requests);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleDeleteData = async () => {
    if (selectedCategories.length === 0) {
      alert('Please select at least one category to delete');
      return;
    }

    if (!confirm('Are you sure you want to delete the selected data? This action cannot be undone.')) {
      return;
    }

    try {
      setIsDeleting(true);
      
      const response = await fetch('/api/user/delete-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          categories: selectedCategories,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setDeletionRequests(prev => [result, ...prev]);
        setSelectedCategories([]);
        alert('Data deletion request submitted successfully');
      } else {
        throw new Error('Failed to submit deletion request');
      }
    } catch (error) {
      console.error('Error deleting data:', error);
      alert('Failed to submit deletion request. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDownloadData = async () => {
    try {
      setIsDownloading(true);
      
      const response = await fetch('/api/user/download-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          categories: selectedCategories.length > 0 ? selectedCategories : dataCategories.map(c => c.id),
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `quizmania-data-${new Date().toISOString().split('T')[0]}.zip`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        throw new Error('Failed to download data');
      }
    } catch (error) {
      console.error('Error downloading data:', error);
      alert('Failed to download data. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'processing':
        return <Progress className="h-4 w-4 text-blue-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'secondary',
      processing: 'default',
      completed: 'default',
      failed: 'destructive'
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Privacy & Data Management</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your data and privacy settings. Download your data or request deletion.
        </p>
      </div>

      {/* Data Categories */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Your Data Categories
          </CardTitle>
          <CardDescription>
            Select the data categories you want to download or delete
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {dataCategories.map((category) => (
              <div
                key={category.id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedCategories.includes(category.id)
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                }`}
                onClick={() => handleCategoryToggle(category.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium">{category.name}</h3>
                      {!category.canDelete && (
                        <Badge variant="outline" className="text-xs">
                          Required
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {category.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>Size: {category.size}</span>
                      <span>Updated: {category.lastUpdated.toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {category.canDownload && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCategories([category.id]);
                          handleDownloadData();
                        }}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between mt-6 pt-6 border-t">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {selectedCategories.length} of {dataCategories.length} categories selected
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleDownloadData}
                disabled={isDownloading || selectedCategories.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                {isDownloading ? 'Downloading...' : 'Download Selected'}
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteData}
                disabled={isDeleting || selectedCategories.length === 0}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {isDeleting ? 'Deleting...' : 'Delete Selected'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Deletion Requests */}
      {deletionRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Deletion Requests</CardTitle>
            <CardDescription>
              Track the status of your data deletion requests
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {deletionRequests.map((request) => (
                <div key={request.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(request.status)}
                      {getStatusBadge(request.status)}
                    </div>
                    <span className="text-sm text-gray-500">
                      {request.requestedAt.toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Requested deletion of: {request.categories.join(', ')}
                  </p>
                  {request.completedAt && (
                    <p className="text-xs text-gray-500">
                      Completed: {request.completedAt.toLocaleDateString()}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Privacy Notice */}
      <Alert className="mt-8">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Important:</strong> Data deletion requests are processed within 30 days. 
          Some data may be retained for legal or security purposes. 
          For immediate account deletion, please contact support.
        </AlertDescription>
      </Alert>
    </div>
  );
} 