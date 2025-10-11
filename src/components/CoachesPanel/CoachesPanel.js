import React from "react";
import "./CoachesPanel.css";
import coach1 from "../../assets/image/coach1.jpg";
import coach2 from "../../assets/image/coach2.jpg";
import coach3 from "../../assets/image/coach3.jpg";
import coach4 from "../../assets/image/coach4.jpg";

export default function CoachesPanel() {
  const coaches = [
    {
      id: 1,
      name: "LUCA MORETTI",
      specialty: "Trail Running Expert",
      image: coach1,
      social: {
        facebook: "#",
        instagram: "#",
        twitter: "#",
      },
    },
    {
      id: 2,
      name: "EMILY PARKER",
      specialty: "Women's Running Coach",
      image: coach2,
      social: {
        facebook: "#",
        instagram: "#",
        twitter: "#",
      },
    },
    {
      id: 3,
      name: "SOPHIE MUELLER",
      specialty: "Recovery Prevention Coach",
      image: coach3,
      social: {
        facebook: "#",
        instagram: "#",
        twitter: "#",
      },
    },
    {
      id: 4,
      name: "DANIEL BENNETT",
      specialty: "Marathon Strategy",
      image: coach4,
      social: {
        facebook: "#",
        instagram: "#",
        twitter: "#",
      },
    },
  ];

  return (
    <section className="coaches-panel">
      <div className="container-fluid">
        <div className="coaches-header">
          <div className="coaches-badge">
            <span>— MEET OUR COACHES —</span>
          </div>
          <h2 className="coaches-main-title">
            OUR EXPERIENCED COACHES
            <br />
            ARE HERE TO SUPPORT
          </h2>
          <div className="coaches-button-section">
            <button className="see-full-team-btn">
              SEE FULL COACHING TEAM
            </button>
          </div>
        </div>

        <div className="row coaches-grid">
          {coaches.map((coach) => (
            <div key={coach.id} className="col-lg-3 col-md-6 col-sm-6 mb-4">
              <div className="coach-card">
                <div className="coach-image-container">
                  <img
                    src={coach.image}
                    alt={coach.name}
                    className="coach-image"
                  />
                  <div className="social-icons">
                    <a href={coach.social.facebook} className="social-icon">
                      <i className="fab fa-facebook-f"></i>
                    </a>
                    <a href={coach.social.instagram} className="social-icon">
                      <i className="fab fa-instagram"></i>
                    </a>
                    <a href={coach.social.twitter} className="social-icon">
                      <i className="fab fa-twitter"></i>
                    </a>
                  </div>
                </div>
                <div className="coach-info">
                  <h3 className="coach-name">{coach.name}</h3>
                  <p className="coach-specialty">{coach.specialty}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
