// WikiPage.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const WikiPage = () => {
  const { title } = useParams();
  const [pageContent, setPageContent] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/read/${title}`);
        setPageContent(response.data.htmlContent);
      } catch (error) {
        console.error('Error fetching page content:', error);
      }
    };

    fetchData();
  }, [title]);

  return (
    <div>
      <h1>{title}</h1>
      <div dangerouslySetInnerHTML={{ __html: pageContent }}></div>
    </div>
  );
};

export default WikiPage;
