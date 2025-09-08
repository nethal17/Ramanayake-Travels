import React from "react";
import { SearchBar } from "../components/SearchBar";
import { FeaturedVehicles } from "../components/FeaturedVehicles";
import { DetailsSection } from "../components/DetailsSection";
import { Reviews } from "../components/Reviews";
import { Footer } from "../components/Footer";


const HomePage = () => {
  return (
    <>
      <SearchBar />
      <FeaturedVehicles />
      <DetailsSection />
      <Reviews />
    </>
  );
};

export default HomePage;
