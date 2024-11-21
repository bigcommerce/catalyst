import React from 'react';

interface TestimonialProps {
  title: string;
  content: string;
  name: string;
  position: string;
}

const StarRating: React.FC = () => (
  <div className="mb-4 flex">
    {[1, 2, 3, 4, 5].map((star) => (
      <svg
        key={star}
        className="h-5 w-5 text-yellow-400"
        fill="currentColor"
        viewBox="0 0 20 20"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))}
  </div>
);

const Testimonial: React.FC<TestimonialProps> = ({ title, content, name, position }) => (
  <div className="flex flex-col">
    <h3 className="mb-3 px-3 text-center text-[16px] font-bold leading-[32px] tracking-[0.5px] text-[#008BB7]">
      {title}
    </h3>
    <p className="mb-3 text-left text-[16px] font-normal leading-[32px] tracking-[0.5px] text-[#353535]">
      {content}
    </p>

    <div className="flex flex-col">
      <div className="mb-3">
        <span className="text-[16px] font-bold leading-[32px] tracking-[0.5px] text-[#353535]">
          {name},{' '}
        </span>
        <span className="text-[16px] font-medium italic leading-[32px] tracking-[0.5px] text-[#353535]">
          {position}
        </span>
      </div>
      <StarRating />
    </div>
  </div>
);

const HappyProsSection: React.FC = () => {
  const testimonials = [
    {
      title: '"I cannot recommend them enough to anyone who is looking for any type of lighting you might need!"',
      content: "Jeremy and 1StopLighting have been amazing to work with... All of the lighting fixtures we have bought for our landscaping projects have worked great and our clients love the aesthetic - especially at night! Our orders ship almost immediately after placing them. If there has been any issue or we have needed to return for an overage on the lights, Jeremy & 1StopLighting have worked very efficiently with getting that process started.",
      name: "Brook Wilson",
      position: "Cutters Landscaping"
    },
    {
      title: '"They are very helpful and have great products."',
      content: "I've been buying chandeliers and pendant lights from Belami for years. Sandy and the rest of the team have been great to work with. They are very helpful and have great products.",
      name: "Julie de Lancellotti",
      position: "Director of Store Planning, Windsor"
    },
    {
      title: '"Their dedication to customer satisfaction is evident in every interaction."',
      content: "Sandy's company not only met but exceeded our requirements, consistently going above and beyond to ensure that our needs were met efficiently and effectively. Their attention to detail, proactive communication, and willingness to accommodate our specific requests were particularly noteworthy. We are truly impressed by Sandy's leadership and the outstanding performance of her team.",
      name: "Kona Contractors",
      position: "Company"
    }
  ];

  return (
    <div className="m-auto w-[94%]">
      <h2 className="mb-[40px] mt-[40px] text-center text-[24px] font-normal leading-[32px] text-[#353535]">
        Happy Pros
      </h2>

      <div className="grid grid-cols-1 gap-16 pb-[2em] md:grid-cols-3 md:px-8">
        {testimonials.map((testimonial, index) => (
          <Testimonial
            key={index}
            {...testimonial}
          />
        ))}
      </div>
    </div>
  );
};

export default HappyProsSection;