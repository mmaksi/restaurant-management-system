import { Dispatch, SetStateAction } from 'react';
import { SUBMISSION_STATUSES_FILTER } from '@/lib/constants/filters';
import { getStatusBadge } from '@/lib/helpers';

interface StatusFilterProps {
  submissionFilter: SUBMISSION_STATUSES_FILTER;
  setSubmissionFilter: Dispatch<SetStateAction<SUBMISSION_STATUSES_FILTER>>;
}

const StatusFilter = (props: StatusFilterProps) => {
  const { submissionFilter, setSubmissionFilter } = props;
  return (
    <div>
      <p className="text-xs font-semibold text-slate-600 mb-2">
        Filter by Submission Status:
      </p>
      <div className="flex flex-wrap gap-2">
        {Object.values(SUBMISSION_STATUSES_FILTER).map(
          (status: SUBMISSION_STATUSES_FILTER) => {
            const badge = getStatusBadge(status);
            const Icon = badge.icon;
            const isSelected = submissionFilter === status;

            return (
              <button
                key={status}
                onClick={() => setSubmissionFilter(status)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors flex items-center space-x-1 ${
                  isSelected
                    ? `${badge.bg} ${badge.text}`
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {Icon && <Icon className="w-3 h-3" />}
                <span>{badge.label}</span>
              </button>
            );
          }
        )}
      </div>
    </div>
  );
};

export default StatusFilter;
