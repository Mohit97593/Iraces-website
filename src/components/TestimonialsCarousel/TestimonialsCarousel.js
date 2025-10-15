import React, { useEffect, useRef } from "react";
import "./TestimonialsCarousel.css";

const testimonials = [
  {
    name: "Sarah M.",
    role: "Beginner Runner",
    text: "I joined Runmate to get fit, but I found so much more. The training plan was easy to follow, and I finished my first 5K without stopping! Quisque ac felis finibus, pretium arcu vitae, pulvinar nulla. In luctus justo sapien, non maximus sapien interdum sed.",
    stars: 5,
    img: "https://randomuser.me/api/portraits/women/44.jpg",
  },
  {
    name: "Liam B.",
    role: "10K Competitive Runner",
    text: "The coaches are amazing! They helped me shave 4 minutes off my 10K personal best. I never thought pacing could make such a difference. Quisque ac felis finibus, pretium arcu vitae, pulvinar nulla. In luctus justo sapien, non maximus sapien interdum sed.",
    stars: 5,
    img: "https://randomuser.me/api/portraits/men/45.jpg",
  },
  {
    name: "Priya S.",
    role: "Half Marathoner",
    text: "Runmate gave me the confidence to run my first half marathon. The community is so supportive! Quisque ac felis finibus, pretium arcu vitae, pulvinar nulla.",
    stars: 5,
    img: "https://randomuser.me/api/portraits/women/46.jpg",
  },
  {
    name: "Alex T.",
    role: "Trail Runner",
    text: "I love the variety in the training plans. Trail running became fun and challenging! Quisque ac felis finibus, pretium arcu vitae, pulvinar nulla.",
    stars: 5,
    img: "https://randomuser.me/api/portraits/men/47.jpg",
  },
  {
    name: "Maya R.",
    role: "Fitness Enthusiast",
    text: "The app keeps me motivated every week. I never miss a run now! Quisque ac felis finibus, pretium arcu vitae, pulvinar nulla.",
    stars: 5,
    img: "https://randomuser.me/api/portraits/women/48.jpg",
  },
  {
    name: "John D.",
    role: "Marathon Finisher",
    text: "Thanks to Runmate, I completed my first marathon! The tips and plans are top-notch. Quisque ac felis finibus, pretium arcu vitae, pulvinar nulla.",
    stars: 5,
    img: "https://randomuser.me/api/portraits/men/49.jpg",
  },
];

function TestimonialsCarousel() {
  const carouselRef = useRef(null);

  useEffect(() => {
    let interval;
    function startScroll() {
      interval = setInterval(() => {
        if (carouselRef.current) {
          const { scrollLeft, offsetWidth, scrollWidth } = carouselRef.current;
          if (scrollLeft + offsetWidth >= scrollWidth - 10) {
            carouselRef.current.scrollTo({ left: 0, behavior: "auto" });
          } else {
            carouselRef.current.scrollBy({ left: 400, behavior: "smooth" });
          }
        }
      }, 3000);
    }
    startScroll();
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="testimonials-section container-fluid">
      <div className="testimonials-header row justify-content-center align-items-center text-center">
        <div className="col-12 col-md-3 mb-2 mb-md-0">
          <span className="testimonials-label d-inline-block w-100">
            - TESTIMONIALS -
          </span>
        </div>
        <div className="col-12 col-md-6 mb-2 mb-md-0">
          <h2 className="testimonials-title w-100">
            REAL RUNNERS, REAL STORIES
          </h2>
        </div>
        <div className="col-12 col-md-3">
          <button className="testimonials-cta w-100">JOIN THE COMMUNITY</button>
        </div>
      </div>
      <div
        className="testimonials-carousel d-flex flex-row flex-nowrap"
        ref={carouselRef}
      >
        {testimonials.map((t, idx) => (
          <div className="testimonial-card" key={idx}>
            <div className="testimonial-stars">
              {Array.from({ length: t.stars }).map((_, i) => (
                <span key={i} className="star">
                  ★
                </span>
              ))}
            </div>
            <p className="testimonial-text">“{t.text}”</p>
            <div className="testimonial-user d-flex align-items-center">
              <img src={t.img} alt={t.name} className="testimonial-img me-2" />
              <div>
                <div className="testimonial-name">{t.name}</div>
                <div className="testimonial-role">{t.role}</div>
              </div>
            </div>
            <div className="testimonial-quote">❞</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TestimonialsCarousel;
