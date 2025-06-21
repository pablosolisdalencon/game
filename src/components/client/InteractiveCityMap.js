"use client";
import React, { useState } from 'react';
import OfficeModal from '../OfficeModal'; // Adjust path if OfficeModal is moved or structure changes
import GameDisplayModal from '../GameDisplayModal'; // Adjust path
// We assume ui.css or a global css handles styling for .city-map-grid, .city-build

const InteractiveCityMap = ({ officeData }) => {
  const [selectedOffice, setSelectedOffice] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [gameMission, setGameMission] = useState(null);
  const [isGameDisplayModalOpen, setIsGameDisplayModalOpen] = useState(false);

  const handleOfficeClick = (officeId) => {
    // Ensure officeData is available and is an array
    if (!officeData || !Array.isArray(officeData)) {
      console.error("InteractiveCityMap: officeData is not available or not an array.");
      return;
    }
    const office = officeData.find(o => o.id === officeId);
    if (office) {
      setSelectedOffice(office);
      setIsModalOpen(true);
    } else {
      console.warn(`InteractiveCityMap: Office with id ${officeId} not found.`);
    }
  };

  const closeOfficeModal = () => {
    setIsModalOpen(false);
    setSelectedOffice(null); // Also clear selected office
  };

  const handleAcceptMissionFromOffice = (mission) => {
    // OfficeModal calls this. It will have already called its own onClose,
    // which triggers closeOfficeModal() here.
    setGameMission(mission);
    setIsGameDisplayModalOpen(true);
  };

  const closeGameDisplayModal = () => {
    setIsGameDisplayModalOpen(false);
    setGameMission(null);
  };

  // This JSX is essentially moved from ui.js
  // Specific building IDs for onClick handlers need to match IDs in officeData
  const cityBuilds = [
    { id: 'mineriaBuild', label: 'CB 1', className: 'city-build mineriaBuild' },
    { id: 'cb2', label: 'CB 2', className: 'city-build' }, // Generic, no specific office data assumed unless ID matches
    { id: 'cb3', label: 'CB 3', className: 'city-build' },
    { id: 'cb4', label: 'CB 4', className: 'city-build' }, // Added placeholder
    { id: 'construccionBuild', label: 'CB 5', className: 'city-build construccionBuild' },
    { id: 'cb6', label: 'CB 6', className: 'city-build' },
    { id: 'cb7', label: 'CB 7', className: 'city-build' }, // Added placeholder
    { id: 'cb8', label: 'CB 8', className: 'city-build' }, // Added placeholder
    { id: 'cb9', label: 'CB 9', className: 'city-build' },
    { id: 'cb10', label: 'CB 10', className: 'city-build' }, // Added placeholder
    { id: 'hotelBuild', label: 'CB 11', className: 'city-build hotelBuild' },
    { id: 'cb12', label: 'CB 12', className: 'city-build' },
    { id: 'gobiernoBuild', label: 'CB 13', className: 'city-build gobiernoBuild' },
    { id: 'cb14', label: 'CB 14', className: 'city-build' },
    { id: 'exploracionBuild', label: 'CB 15', className: 'city-build exploracionBuild' },
    { id: 'cb16', label: 'CB 16', className: 'city-build' },
    { id: 'cb17', label: 'CB 17', className: 'city-build' },
    { id: 'cb18', label: 'CB 18', className: 'city-build' }, // Added placeholder
    { id: 'cb19', label: 'CB 19', className: 'city-build' }, // Added placeholder
    { id: 'cb20', label: 'CB 20', className: 'city-build' }, // Added placeholder
    { id: 'miliciaBuild', label: 'CB 21', className: 'city-build miliciaBuild' },
    { id: 'cb22', label: 'CB 22', className: 'city-build' },
    { id: 'cb23', label: 'CB 23', className: 'city-build' }, // Added placeholder
    { id: 'cb24', label: 'CB 24', className: 'city-build' }, // Added placeholder
    { id: 'fabricaBuild', label: 'CB 25', className: 'city-build fabricaBuild' },
  ];


  return (
    <>
      <div className="city-map-grid">
        {cityBuilds.map(build => (
          <div
            key={build.id}
            className={build.className}
            onClick={() => officeData.some(o => o.id === build.id) ? handleOfficeClick(build.id) : null}
          >
            {build.label}
          </div>
        ))}
        {/* Fallback if cityBuilds array is not exhaustive - this won't be needed if cityBuilds has 25 items */}
        {/*
        {Array.from({ length: Math.max(0, 25 - cityBuilds.length) }).map((_, index) => (
          <div key={`placeholder-${index}`} className="city-build">CB Placeholder</div>
        ))}
        */}
      </div>

      {isModalOpen && selectedOffice && (
        <OfficeModal
          office={selectedOffice}
          onClose={closeOfficeModal}
          onAcceptMission={handleAcceptMissionFromOffice}
        />
      )}
      {isGameDisplayModalOpen && gameMission && (
        <GameDisplayModal
          mission={gameMission}
          onClose={closeGameDisplayModal}
        />
      )}
    </>
  );
};

export default InteractiveCityMap;
