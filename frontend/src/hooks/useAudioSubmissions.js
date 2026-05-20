
// src/hooks/useAudioSubmissions.js
import { useState, useEffect } from 'react';
import axios from 'axios';

const BASE_URL = '';

const useAudioSubmissions = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch submissions
  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BASE_URL}/audio`);
      setSubmissions(response.data?.data || []);
      setError(null);
    } catch (err) {
      setError(err.message);
      setSubmissions([]);
      console.error('Error fetching submissions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  // Update submission status
  const updateSubmission = async (submission) => {
    try {
      let endpoint;
      if (submission.status === 'approved') {
        endpoint = 'approve';
      } else if (submission.status === 'rejected') {
        endpoint = 'reject';
      } else {
        throw new Error('Invalid status: must be approved or rejected');
      }

      const response = await axios.post(`${BASE_URL}/audio/${endpoint}`, {
        id: submission.id,
        remark: submission.remark
      });

      if (response.data) {
        await fetchSubmissions();
        return { success: true };
      }
    } catch (err) {
      console.error('Error updating submission:', err);
      throw new Error(err.response?.data?.message || err.message || 'Failed to update submission');
    }
  };

  // Delete submission
  const deleteSubmission = async (id) => {
    try {
      await axios.post(`${BASE_URL}/audio/delete`, { id });
      await fetchSubmissions(); // Refresh the list
      return { success: true };
    } catch (err) {
      console.error('Error deleting submission:', err);
      throw new Error(err.response?.data?.message || 'Failed to delete submission');
    }
  };

  return {
    audioSubmissions: submissions,
    updateSubmission,
    deleteSubmission,
    loading,
    error,
    refreshSubmissions: fetchSubmissions
  };
};

export default useAudioSubmissions;