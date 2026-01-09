import { Feature } from '@/lib/types';
import Link from 'next/link';

type FeatureProps = {
  feature: Feature;
};

const FeatureCard = (props: FeatureProps) => {
  const { feature } = props;
  const Icon = feature.icon;

  const content = (
    <div
      className={`relative overflow-hidden rounded-xl bg-white shadow-md transition-all duration-300 ${
        feature.available
          ? 'hover:shadow-xl hover:-translate-y-1 cursor-pointer'
          : 'opacity-60 cursor-not-allowed'
      }`}
    >
      <div className="p-6">
        <div
          className={`inline-flex p-3 rounded-lg ${feature.color} bg-opacity-10 mb-4`}
        >
          <Icon
            className={`w-8 h-8 ${feature.color.replace('bg-', 'text-')}`}
          />
        </div>
        <h3 className="text-xl font-semibold text-slate-900 mb-2">
          {feature.title}
        </h3>
        <p className="text-slate-600 text-sm mb-4">{feature.description}</p>
        {!feature.available && (
          <span className="inline-block px-3 py-1 text-xs font-medium bg-slate-100 text-slate-600 rounded-full">
            Coming Soon
          </span>
        )}
        {feature.available && (
          <span className="inline-flex items-center text-sm font-medium text-blue-600">
            Open →
          </span>
        )}
      </div>
      {feature.available && (
        <div
          className={`absolute top-0 right-0 w-32 h-32 ${feature.color} opacity-5 rounded-full -mr-16 -mt-16`}
        ></div>
      )}
    </div>
  );

  return feature.available ? (
    <Link key={feature.title} href={feature.href}>
      {content}
    </Link>
  ) : (
    <div key={feature.title}>{content}</div>
  );
};

export default FeatureCard;
