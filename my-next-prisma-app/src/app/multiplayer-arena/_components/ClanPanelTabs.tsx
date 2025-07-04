import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Shield, Users, MapPin, Search, Image } from 'lucide-react';
import useSWR from 'swr';
import ClanModal from '../components/ClanModal';
import toast from 'react-hot-toast';

const fetcher = (url: string) => fetch(url).then(res => res.json());

const regions = ['US-East', 'US-West', 'EU', 'Asia', 'India'];

const DiscoverClansTab = () => {
  const [search, setSearch] = useState('');
  const [region, setRegion] = useState('All');
  const [page, setPage] = useState(1);
  const [selectedClan, setSelectedClan] = useState<any>(null);
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const { data: userClanData } = useSWR('/api/clans?my=1', fetcher);
  const myClanId = userClanData?.clans?.[0]?.id || null;
  const { data: myRequestsData } = useSWR('/api/clans/join-requests?my=1', fetcher);
  const myRequests = myRequestsData?.requests?.map((r: any) => r.clanId) || [];
  const { data, error, isLoading, mutate } = useSWR(`/api/clans?search=${encodeURIComponent(search)}&region=${region}&page=${page}`, fetcher);
  const clans = data?.clans || [];
  const total = data?.total || 0;
  const pageSize = 10;

  const handleJoin = async (clan: any) => {
    setJoiningId(clan.id);
    await fetch('/api/clans/join-requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clanId: clan.id }),
    });
    setJoiningId(null);
    mutate();
  };

  return (
    <div>
      {/* ...search/filter UI... */}
      {isLoading ? <div className="text-center text-slate-400 py-12">Loading clans...</div> : error ? <div className="text-center text-red-500 py-12">Failed to load clans.</div> : clans.length === 0 ? <div className="text-center text-slate-400 py-12">No clans found.</div> : (
        <div className="space-y-4">
          {clans.map((clan: any) => (
            <ClanCard
              key={clan.id}
              clan={clan}
              onClick={() => setSelectedClan(clan)}
              onJoin={() => handleJoin(clan)}
              joining={joiningId === clan.id}
              isMember={myClanId === clan.id}
              hasRequested={myRequests.includes(clan.id)}
            />
          ))}
        </div>
      )}
      {/* ...pagination and modal... */}
    </div>
  );
};

const CreateClanTab = ({ onCreated }: { onCreated: (clan: any) => void }) => {
  const [name, setName] = useState('');
  const [motto, setMotto] = useState('');
  const [region, setRegion] = useState(regions[0]);
  const [emblemUrl, setEmblemUrl] = useState('https://api.dicebear.com/8.x/icons/svg?seed=clan');
  const [loading, setLoading] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return toast.error('Clan name is required');
    setLoading(true);
    try {
      const res = await fetch('/api/clans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, motto, region, emblemUrl }),
      });
      if (!res.ok) throw new Error('Failed to create clan');
      const data = await res.json();
      toast.success('Clan created!');
      onCreated(data.clan);
    } catch {
      toast.error('Failed to create clan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleCreate} className="max-w-md mx-auto space-y-6">
      <div>
        <label className="block text-sm font-medium mb-1">Clan Name</label>
        <Input value={name} onChange={e => setName(e.target.value)} placeholder="Enter clan name" required maxLength={32} />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Motto</label>
        <Input value={motto} onChange={e => setMotto(e.target.value)} placeholder="Enter clan motto" maxLength={64} />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Region</label>
        <select value={region} onChange={e => setRegion(e.target.value)} className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-2 py-2">
          {regions.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Emblem/Logo</label>
        <div className="flex items-center gap-3">
          <img src={emblemUrl} alt="emblem" className="w-16 h-16 rounded-full border-2 border-slate-300 dark:border-slate-700" />
          <Input value={emblemUrl} onChange={e => setEmblemUrl(e.target.value)} placeholder="Paste image URL or use DiceBear" />
          <Button type="button" size="icon" variant="outline" onClick={() => setEmblemUrl(`https://api.dicebear.com/8.x/icons/svg?seed=${Math.random().toString(36).substring(2, 8)}`)}><Image size={18} /></Button>
        </div>
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Creating...' : 'Create Clan'}
      </Button>
    </form>
  );
};

const ClanPanelTabs = () => {
  const [tab, setTab] = useState('my');
  const [myClan, setMyClan] = useState<any>(null);
  return (
    <div className="w-full max-w-3xl mx-auto bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-6 mt-8">
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="my">My Clan</TabsTrigger>
          <TabsTrigger value="discover">Discover Clans</TabsTrigger>
          <TabsTrigger value="create">Create Clan</TabsTrigger>
        </TabsList>
        <TabsContent value="my">
          {myClan ? (
            <ClanModal isOpen={true} onClose={() => setMyClan(null)} clan={myClan} />
          ) : (
            <div className="text-center text-slate-500 py-12">You are not in a clan. Join or create one!</div>
          )}
        </TabsContent>
        <TabsContent value="discover">
          <DiscoverClansTab />
        </TabsContent>
        <TabsContent value="create">
          <CreateClanTab onCreated={clan => { setMyClan(clan); setTab('my'); }} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClanPanelTabs; 