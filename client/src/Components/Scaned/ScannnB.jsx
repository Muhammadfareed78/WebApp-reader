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
            return;
        }

        setLoading(true);
        setError('');
        setStructuredData(null);

        const formData = new FormData();
        formData.append('image', image);

        try {
            const API_BASE_URL = import.meta.env.REACT_APP_BACKEND_BASE_URL || "http://localhost:3000/";
const response = await fetch(`${API_BASE_URL}api/ocr`, { method: 'POST', body: formData });


            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

            const data = await response.json();
            setStructuredData(data.structuredData);
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
                    {/* <h3>Uploaded Image:</h3> */}
                    <img width={500} src={imagePreview} alt="Preview" />
                </div>
            )}

            {error && <p className="error-message">Error: {error}</p>}

            {structuredData && (
                <div className="structured-output">
                    <h2>Extracted Information</h2>
                    {structuredData.website && <div className="info-item"><strong>Designation:</strong> {structuredData.designation}</div>}
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
