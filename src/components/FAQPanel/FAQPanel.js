import React, { useState } from "react";
import "./FAQPanel.css";
import faqImage from "../../assets/image/09cbb1e84b3bf91549ba83bb53aceeb0.jpg";

const faqs = [
  {
    id: 1,
    question: "DO I NEED TO BE AN EXPERIENCED RUNNER TO JOIN RUNMATE?",
    answer:
      "Far far away, behind the word mountains, far from the countries Vokalia and Consonantia, there live the blind texts. Separated they live in Bookmarksgrove right at the coast",
    isOpen: true,
  },
  {
    id: 2,
    question: "HOW TO CHANGE MY PASSWORD EASILY?",
    answer:
      "Far far away, behind the word mountains, far from the countries Vokalia and Consonantia, there live the blind texts. Separated they live in Bookmarksgrove right at the coast",
    isOpen: false,
  },
  {
    id: 3,
    question: "WHAT'S INCLUDED IN THE TRAINING PROGRAMS?",
    answer:
      "Far far away, behind the word mountains, far from the countries Vokalia and Consonantia, there live the blind texts. Separated they live in Bookmarksgrove right at the coast",
    isOpen: false,
  },
  {
    id: 4,
    question: "ARE THE PROGRAMS TAILORED TO DIFFERENT FITNESS LEVELS?",
    answer:
      "Far far away, behind the word mountains, far from the countries Vokalia and Consonantia, there live the blind texts. Separated they live in Bookmarksgrove right at the coast",
    isOpen: false,
  },
];

export default function FAQPanel() {
  const [faqList, setFaqList] = useState(faqs);

  const toggleFAQ = (id) => {
    setFaqList(
      faqList.map((faq) =>
        faq.id === id
          ? { ...faq, isOpen: !faq.isOpen }
          : { ...faq, isOpen: false }
      )
    );
  };

  return (
    <section className="faq-section">
      <div className="faq-container">
        <div className="faq-content">
          <div className="faq-left">
            <div className="faq-header">
              <span className="faq-badge">– FAQS –</span>
              <h2 className="faq-title">FREQUENTLY ASKED QUESTIONS</h2>
            </div>
            <div className="faq-list">
              {faqList.map((faq) => (
                <div
                  key={faq.id}
                  className={`faq-item ${faq.isOpen ? "active" : ""}`}
                >
                  <button
                    className="faq-question"
                    onClick={() => toggleFAQ(faq.id)}
                  >
                    {faq.question}
                    <span className="faq-icon">{faq.isOpen ? "↑" : "↓"}</span>
                  </button>
                  {faq.isOpen && (
                    <div className="faq-answer">
                      <p>{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="faq-right">
            <img src={faqImage} alt="FAQ" className="faq-image" />
          </div>
        </div>
      </div>
    </section>
  );
}
