import React from 'react';

interface FeedbackData {
  id: string ;
  user_id: string | number;
  rating: number;
  content?: string | null;
  created_at: string | Date;
  full_name: string;
  image?: string | null;
}

interface FeedbackProps {
  feedback: FeedbackData;
}

const FeedbackCard: React.FC<FeedbackProps> = ({ feedback }) => {
  const { rating, content, created_at, full_name, image } = feedback;
  const dateStr = new Date(created_at).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const renderStars = () => {
    return Array.from({ length: 5 }).map((_, index) => (
      <svg
        key={index}
        className={`w-5 h-5 ${index < rating ? 'text-yellow-400' : 'text-gray-200'}`}
        fill="currentColor"
        viewBox="0 0 20 20"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
  };

  return (
    <div className="bg-white/80 backdrop-blur-md border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 group hover:-translate-y-1">
      <div className="flex justify-between items-start mb-5">
        <div className="flex items-center gap-4">
          <div className="relative">
            {image ? (
              <img 
                src={image} 
                alt={full_name || 'User'} 
                className="w-12 h-12 rounded-full object-cover border-2 border-indigo-50 group-hover:border-indigo-200 transition-colors"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-inner">
                {getInitials(full_name)}
              </div>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-lg leading-tight">
              {full_name || 'Anonymous User'}
            </h3>
            <span className="text-sm text-gray-500 font-medium">{dateStr}</span>
          </div>
        </div>
        <div className="flex gap-1 items-center bg-amber-50 px-3 py-1.5 rounded-full border border-amber-100/50 shadow-sm">
          {renderStars()}
        </div>
      </div>
      
      <div className="relative">
        <svg className="absolute -top-3 -left-2 w-8 h-8 text-indigo-100/60 transform -scale-x-100 z-0" fill="currentColor" viewBox="0 0 32 32" aria-hidden="true">
          <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.896 3.456-8.352 9.12-8.352 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
        </svg>
        <p className="text-gray-700 leading-relaxed relative z-10 pl-5 italic font-medium">
          "{content || 'No feedback content provided.'}"
        </p>
      </div>
    </div>
  );
};

export {FeedbackCard, type FeedbackData};
