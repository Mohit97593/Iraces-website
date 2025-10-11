import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { toggleModal } from "../../slice/hero/heroSlice";

export default function HeroModal() {
  const modalOpen = useSelector((s) => s.hero.modalOpen);
  const dispatch = useDispatch();

  return (
    <div
      className={`modal fade ${modalOpen ? "show d-block" : ""}`}
      tabIndex={-1}
      role="dialog"
    >
      <div className="modal-dialog modal-lg" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">About our races</h5>
            <button
              type="button"
              className="btn-close"
              aria-label="Close"
              onClick={() => dispatch(toggleModal())}
            ></button>
          </div>
          <div className="modal-body">
            <p>
              Here you can add rich content about upcoming races, signup links,
              maps, and more.
            </p>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => dispatch(toggleModal())}
            >
              Close
            </button>
            <button type="button" className="btn btn-primary">
              Sign up
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
