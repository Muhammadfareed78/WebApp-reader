import React, { useState } from 'react';
import './ScannB.css';
import dotenv from 'dotenv';

function ScannB() {
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [structuredData, setStructuredData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        console.log("File selected:", file);

        if (file) {
            setImage(file);
            setImagePreview(URL.createObjectURL(file));
            setStructuredData(null);
            setError('');
        }
    };

    const handleExtractText = async () => {
        if (!image) {
            alert('Please select an image first.');
            console.log("No image selected.");
            return;
        }

        console.log("Starting text extraction...");
        setLoading(true);
        setError('');
        setStructuredData(null);

        const formData = new FormData();
        formData.append('image', image);
        console.log("Form data prepared:", formData);

        try {
            const API_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;
            console.log("API_BASE_URL:", API_BASE_URL);

            // Check if the API_BASE_URL is correctly set
            if (!API_BASE_URL) {
                console.error("API_BASE_URL is not set.");
                setError("API_BASE_URL is not set. Please check your environment variables.");
                return;
            }

            const response = await fetch(`${API_BASE_URL}api/ocr`, { method: 'POST', body: formData });
            console.log("API response status:", response.status);

            if (!response.ok) {
                console.error("Error with response:", response.status);
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            console.log("OCR response data:", data);

            if (data.structuredData) {
                setStructuredData(data.structuredData);
            } else {
                console.error("No structured data found in response.");
                setError("No structured data found. Please try again.");
            }
            setLoading(false);
        } catch (error) {
            console.error("Error during text extraction:", error);
            setError('Failed to extract text. Please try again.');
            setLoading(false);
        }
    };

    return (
        <div className="App">
            <h1>Business Card OCR</h1>
            <div className="upload-section">
                <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleImageChange}
                />
                <button onClick={handleExtractText} disabled={!image || loading}>
                    {loading ? 'Extracting...' : 'Extract Text'}
                </button>
            </div>

            {imagePreview && (
                <div className="image-preview">
                    <img width={500} src={imagePreview} alt="Preview" />
                </div>
            )}

            {error && <p className="error-message">Error: {error}</p>}

            {structuredData && (
                <div className="structured-output">
                    <h2>Extracted Information</h2>
                    {structuredData.designation && <div className="info-item"><strong>Designation:</strong> {structuredData.designation}</div>}
                    {structuredData.name && <div className="info-item"><strong>Name:</strong> {structuredData.name}</div>}
                    {structuredData.email && <div className="info-item"><strong>Email:</strong> {structuredData.email}</div>}
                    {structuredData.phone && <div className="info-item"><strong>Phone:</strong> {structuredData.phone}</div>}
                    {structuredData.website && <div className="info-item"><strong>Website:</strong> {structuredData.website}</div>}
                    {structuredData.address && <div className="info-item"><strong>Address:</strong> <pre>{structuredData.address}</pre></div>}
                </div>
            )}
        </div>
    );
}

export default ScannB;
