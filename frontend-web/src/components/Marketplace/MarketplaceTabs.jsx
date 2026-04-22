import React, { useState } from 'react';
import { Tabs } from '@headlessui/react';
import AdsManagement from './AdsManagement';
import GemManagement from './GemManagement';
import CreateGemForm from './CreateGemForm';

export default function MarketplaceTabs({ userRole }) {
  const [refreshKey, setRefreshKey] = useState(0);
  const handleGemCreated = () => setRefreshKey(k => k + 1);

  return (
    <Tabs defaultIndex={0} className="w-full">
      <Tabs.List className="flex gap-2 mb-8 border-b border-slate-200">
        <Tabs.Tab className={({ selected }) =>
          `px-6 py-3 font-bold text-base rounded-t-lg border-b-2 transition-all focus:outline-none ${
            selected ? 'border-blue-600 text-blue-700 bg-white' : 'border-transparent text-slate-500 bg-slate-50 hover:bg-slate-100'
          }`
        }>Ads Management</Tabs.Tab>
        <Tabs.Tab className={({ selected }) =>
          `px-6 py-3 font-bold text-base rounded-t-lg border-b-2 transition-all focus:outline-none ${
            selected ? 'border-blue-600 text-blue-700 bg-white' : 'border-transparent text-slate-500 bg-slate-50 hover:bg-slate-100'
          }`
        }>Gem Management</Tabs.Tab>
        <Tabs.Tab className={({ selected }) =>
          `px-6 py-3 font-bold text-base rounded-t-lg border-b-2 transition-all focus:outline-none ${
            selected ? 'border-blue-600 text-blue-700 bg-white' : 'border-transparent text-slate-500 bg-slate-50 hover:bg-slate-100'
          }`
        }>Add Gem</Tabs.Tab>
      </Tabs.List>
      <Tabs.Panels>
        <Tabs.Panel><AdsManagement key={refreshKey} /></Tabs.Panel>
        <Tabs.Panel><GemManagement key={refreshKey} /></Tabs.Panel>
        <Tabs.Panel><CreateGemForm onSuccess={handleGemCreated} userRole={userRole} /></Tabs.Panel>
      </Tabs.Panels>
    </Tabs>
  );
}
