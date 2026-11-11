import React from "react";
import { About } from "../pages/About";
import { GEAR_AND_RENTAL_PRODUCTS } from "../data/forusData";

interface AboutAndContactViewProps {
  theme: "light" | "dark";
  defaultName?: string;
  defaultEmail?: string;
}

export const AboutAndContactView: React.FC<AboutAndContactViewProps> = ({
  defaultName = "",
  defaultEmail = "",
}) => {
  return (
    <About
      products={GEAR_AND_RENTAL_PRODUCTS}
      defaultName={defaultName}
      defaultEmail={defaultEmail}
      onSelectProduct={() => {}}
      onNavigateTab={() => {}}
    />
  );
};

export default AboutAndContactView;
