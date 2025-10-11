import { createSlice } from "@reduxjs/toolkit";

// Import local hero images from assets
import hero1 from "../../assets/image/01035cddb88c6a3ae846c091b77afdc3.jpg";
import hero2 from "../../assets/image/09cbb1e84b3bf91549ba83bb53aceeb0.jpg";
import hero3 from "../../assets/image/465571268966080c5e4503a418030270.jpg";

const initialState = {
  slides: [
    {
      id: 1,
      image: hero1,
      title: "Run Together, Achieve More",
      subtitle: "Join our vibrant running club",
    },
    {
      id: 2,
      image: hero2,
      title: "Sprint to Success",
      subtitle: "Upcoming races & events",
    },
    {
      id: 3,
      image: hero3,
      title: "Beat Your Best",
      subtitle: "Train smart, run faster",
    },
  ],
  currentIndex: 0,
  modalOpen: false,
};

export const heroSlice = createSlice({
  name: "hero",
  initialState,
  reducers: {
    nextSlide: (state) => {
      state.currentIndex = (state.currentIndex + 1) % state.slides.length;
    },
    prevSlide: (state) => {
      state.currentIndex =
        (state.currentIndex - 1 + state.slides.length) % state.slides.length;
    },
    goToSlide: (state, action) => {
      state.currentIndex = action.payload;
    },
    toggleModal: (state) => {
      state.modalOpen = !state.modalOpen;
    },
    setSlides: (state, action) => {
      state.slides = action.payload;
      state.currentIndex = 0;
    },
  },
});

export const { nextSlide, prevSlide, goToSlide, toggleModal, setSlides } =
  heroSlice.actions;

export default heroSlice.reducer;
