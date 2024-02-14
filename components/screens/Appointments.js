import React, { useEffect, useState } from 'react';
import axios from 'axios';

const VaccinationData = () => {
  // State variables for vaccination data and error handling
  const [vaccinations, setVaccinations] = useState([]);
  const [error, setError] = useState(null);

  // Fetch vaccination data when the component mounts
  useEffect(() => {
    const fetchVaccinationData = async () => {
      try {
        // Make GET request to the API endpoint
        const response = await axios.get('https://mk-be-strapi-production.up.railway.app/api/vaccinations?populate=*');
        // Extract the vaccination data from the response
        const vaccinationData = response.data.data;
        // Set the vaccination data in the state
        setVaccinations(vaccinationData);
      } catch (error) {
        // Handle any errors that occur during the request
        setError(error.message);
      }
    };

    // Call the fetch function
    fetchVaccinationData();
  }, []);

  // Render the component JSX
  return (
    <div>
      <h1>Vaccination Data</h1>
      {error && <p>Error: {error}</p>}
      <ul>
        {vaccinations.map((vaccination) => (
          <li key={vaccination.id}>
            <p>Date of Vaccination: {vaccination.attributes.dateOfVaccination}</p>
            <p>Date for Next Dose: {vaccination.attributes.dateForNextDose}</p>
            <p>Vaccine Name: {vaccination.attributes.vaccineName}</p>
            <p>Dose: {vaccination.attributes.dose}</p>
            <p>Site Administered: {vaccination.attributes.siteAdministered}</p>
            <p>Facility: {vaccination.attributes.facility}</p>
            <p>Vaccinated By: {vaccination.attributes.vaccinatedBy}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default VaccinationData;
