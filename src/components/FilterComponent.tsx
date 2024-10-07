'use client'

import React, { useEffect, useState } from "react";
import { Disability } from "@/utils/types/disability";
import { getDisabilities } from "@/server/db/actions/DisabilityActions";
import DropdownComponent from "./DropdownComponent";

export default function FilterComponent() {
  const [disabilities, setDisabilities] = useState<Disability[]>([]);
  const [selectedDisabilities, setSelectedDisabilities] = useState<Disability[]>([]);

  useEffect(() => {
    const fetchDisabilities = async () => {
      const disabilityList = await getDisabilities();
      setDisabilities(disabilityList);
    };
    fetchDisabilities();
  }, []);

  const handleSetSelected = (selected: Disability) => {
    setSelectedDisabilities((prevSelected) => {
      if (prevSelected.some((item) => item._id === selected._id)) {
        return prevSelected.filter((item) => item._id !== selected._id);
      } else {
        return [...prevSelected, selected];
      }
    });
  };

  return (
    <div className="relative inline-block w-full flex space-x-4 items-center">
      <label className="block mb-2 text-sm font-medium">Filter By:</label>
        <DropdownComponent
            label={"Disability"}
            data={disabilities}
            selected={selectedDisabilities}
            setSelected={handleSetSelected}
        />
        <DropdownComponent label={"Location"} data={[]} selected={[]} setSelected={() => {}} />
        <DropdownComponent label={"Other Demographics"} data={[]} selected={[]} setSelected={() => {}} />
      
    </div>
  );
}
