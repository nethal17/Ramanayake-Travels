import React from "react";
import { Navbar } from "../components/Navbar";
import { SearchBar } from "../components/SearchBar";
import { FeaturedVehicles } from "../components/FeaturedVehicles";
import { DetailsSection } from "../components/DetailsSection";
import { Reviews } from "../components/Reviews";
import { Footer } from "../components/Footer";


const HomePage = () => {
  return (
    <>
      <Navbar />
      <SearchBar />
      <FeaturedVehicles />
      <DetailsSection />
      <Reviews />
      <Footer />
    </>
  );
};

export default HomePage;
