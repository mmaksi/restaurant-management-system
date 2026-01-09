'use client';

import { useState } from 'react';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ChevronDown, ChevronUp } from 'lucide-react';
import renderSettings from '@/lib/constants/settings';
import { SETTINGS_TITLES } from '@/lib/constants';
import { GetUserProfile } from '@/infra/db/types/db';

interface SettingsContentProps {
  isAdmin: boolean;
  isManager: boolean;
  userProfile: GetUserProfile;
}

export default function SettingsContent({
  isAdmin,
  isManager,
  userProfile,
}: SettingsContentProps) {
  const [expandedSection, setExpandedSection] = useState<SETTINGS_TITLES>(
    SETTINGS_TITLES.PROFILE
  );

  const toggleSection = (sectionId: SETTINGS_TITLES) => {
    setExpandedSection(
      expandedSection === sectionId ? SETTINGS_TITLES.PROFILE : sectionId
    );
  };

  return (
    <div className="space-y-4">
      {renderSettings(isAdmin, isManager, userProfile).map((section) => {
        const Icon = section.icon;
        const isExpanded = expandedSection === section.id;

        return (
          <Card
            key={section.id}
            className="bg-white rounded-xl shadow-md border-slate-200 overflow-hidden transition-all hover:shadow-lg"
          >
            <div
              onClick={() => toggleSection(section.id)}
              className="w-full text-left"
            >
              <CardHeader className="transition-colors cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className={`p-3 rounded-lg ${section.color} bg-opacity-10`}
                    >
                      <Icon
                        className={`w-6 h-6 ${section.color.replace(
                          'bg-',
                          'text-'
                        )}`}
                      />
                    </div>
                    <div>
                      <CardTitle className="text-slate-900">
                        {section.title}
                      </CardTitle>
                      <CardDescription className="text-slate-600">
                        {section.description}
                      </CardDescription>
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  )}
                </div>
              </CardHeader>
            </div>
            {isExpanded && (
              <div>
                <div className="mt-0">{section.content}</div>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}
