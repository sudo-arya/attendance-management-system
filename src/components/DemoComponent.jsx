import React, { useState, useEffect } from "react";
import axios from "axios";

const DemoComponent = () => {
  const [email, setEmail] = useState("deepasnhu04014902021@msijanakpuri.com");

  useEffect(() => {
    const postData = async () => {
      try {
        const response = await axios.post(
          "http://localhost:5000/Bsc-E-2022-B/2024-05-19/oYV3u8",
          { email }
        );
        console.log(response.data);
      } catch (error) {
        console.error("Error:", error.response.data);
      }
    };

    if (email) {
      postData();
    }
  }, [email]);

  return (
    <div>
      <h2>Test Component</h2>
      <label htmlFor="email">Email:</label>
      <input
        type="email"
        id="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
    </div>
  );
};

export default DemoComponent;
