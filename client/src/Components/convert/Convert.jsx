import React, { useState, useRef } from 'react';
import { Camera, Phone, Mail, MapPin, Globe, UserCircle } from 'lucide-react'; // Importing additional icons
import nlp from 'compromise';

const API_KEY = 'AIzaSyAUxh7O4TpsjC7ZaDaIkrmvkCCijTmT_pg';
const API_ENDPOINT = `https://vision.googleapis.com/v1/images:annotate?key=${API_KEY}`;
const API_TIMEOUT_MS = 10000;

const Convert = () => {
    const [imageFile, setImageFile] = useState(null);
    const [extractedText, setExtractedText] = useState('');
    const [cardData, setCardData] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const fileInputRef = useRef(null);

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            setImageFile(file);
            setExtractedText('');
            setCardData({});
            setError(null);
        }
    };

    const parseText = (text) => {
        const doc = nlp(text);
    
        const data = {
            Name: '',
            Profile: '',
            Title: '',
            CompanyName: '',
            Email: '',
            PhoneNumber: '',
            Address: '',
            Website: '',
        };
    
        const lines = text
            .split('\n')
            .map((line) => line.trim())
            .filter((line) => line.length > 0);
    
        // Extract Email
        const emailMatch = text.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/);
        if (emailMatch) data.Email = emailMatch[0];
    
        // Extract Phone Number
        const phoneMatch = text.match(/(\+?\d{1,4}[-.\s]?)?(\(?\d{2,5}\)?[-.\s]?)?(\d{3,5}[-.\s]?\d{3,5}[-.\s]?\d{3,5})/);
        if (phoneMatch) data.PhoneNumber = phoneMatch[0];
    
        // Extract Website
        const websiteMatch = text.match(/(https?:\/\/[^\s]+|www\.[^\s]+)/);
        if (websiteMatch) data.Website = websiteMatch[0];
    
        // Filter out lines containing already matched data
        const filteredLines = lines.filter(
            (line) =>
                !line.includes(data.Email) &&
                !line.includes(data.PhoneNumber) &&
                !line.includes(data.Website)
        );
    
        // Extract Name using regex
        const nameRegex = /\b([A-Z][a-z]+\s[A-Z][a-z]+(?:\s[A-Z][a-z]+)?)\b/; // First Last or First Middle Last
        const nameMatch = filteredLines.find(line => nameRegex.test(line));
        if (nameMatch) {
            data.Name = nameMatch.trim();
            const nameIndex = filteredLines.indexOf(nameMatch);
            if (nameIndex > -1) filteredLines.splice(nameIndex, 1);
        }
    
        // Extract Title using regex
        const titleRegex = /\b(CEO|CTO|COO|Manager|Director|Engineer|Consultant|Specialist|Executive|Analyst|Architect|Officer|President|Developer|Coordinator|Founder|Owner|Partner|Supervisor|Administrator|Strategist)\b/;
        const titleMatch = filteredLines.find(line => titleRegex.test(line));
        if (titleMatch) {
            data.Title = titleMatch.trim();
            const titleIndex = filteredLines.indexOf(titleMatch);
            if (titleIndex > -1) filteredLines.splice(titleIndex, 1);
        }
    
        // Extract Company Name using regex
        const companyRegex = /\b([A-Z][a-zA-Z0-9&'"\-.]+(?:\s[A-Z][a-zA-Z0-9&'"\-.]+)*\s(?:Inc\.?|Ltd\.?|LLC|Corp\.?|Corporation|Group|Technologies|Solutions|Enterprises|Partners|Associates|Firm|International|Industries|Consulting|Services|Pvt\.? Ltd\.?|Co\.|Company))\b/;
        const companyMatch = filteredLines.find(line => companyRegex.test(line));
        if (companyMatch) {
            data.CompanyName = companyMatch.trim();
            const companyIndex = filteredLines.indexOf(companyMatch);
            if (companyIndex > -1) filteredLines.splice(companyIndex, 1);
        }
    
        if (!data.CompanyName && filteredLines.length > 0) {
            data.CompanyName = filteredLines[0];
            filteredLines.shift();
        }
    
        // Extract Address
        const places = doc.places().out('array');
        if (places.length > 0) {
            data.Address = places.join(', ');
        }
    
        if (!data.Address) {
            const addressRegex = /(road|st|ave|colony|distt|near|block|sector)/i;
            const addressMatch = text.match(addressRegex);
            if (addressMatch) data.Address = addressMatch[0];
        }
    
        if (!data.Address && filteredLines.length > 0) {
            data.Address = filteredLines.join(', ');
        }
    
        // Final clean-up for duplicates
        if (data.Name && data.CompanyName && data.Name === data.CompanyName) {
            data.CompanyName = '';
        }
    
        return data;
    };
    

    const processImage = async () => {
        if (!imageFile) {
            alert('Please upload a business card image first.');
            return;
        }

        setLoading(true);
        setError(null);

        const abortController = new AbortController(); // Timeout controller
        const timeoutId = setTimeout(() => abortController.abort(), API_TIMEOUT_MS);

        try {
            const reader = new FileReader();

            reader.onloadend = async () => {
                const base64ImageContent = reader.result.split(',')[1];

                const requestBody = {
                    requests: [
                        {
                            image: { content: base64ImageContent },
                            features: [{ type: 'DOCUMENT_TEXT_DETECTION' }],
                        },
                    ],
                };

                const response = await fetch(API_ENDPOINT, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(requestBody),
                    signal: abortController.signal,
                });

                clearTimeout(timeoutId); // Clear timeout on successful request

                if (!response.ok) {
                    const errorData = await response.json();
                    console.error('Vision API Error Response:', errorData);
                    throw new Error(
                        `Vision API request failed with status ${response.status}: ${errorData?.error?.message || response.statusText}`
                    );
                }

                const responseData = await response.json();
                const fullTextAnnotation = responseData.responses[0]?.fullTextAnnotation;
                const detectedText = fullTextAnnotation ? fullTextAnnotation.text : '';

                if (detectedText) {
                    setExtractedText(detectedText);
                    const parsedData = parseText(detectedText);

                    // Filter only non-empty data blocks
                    const filteredData = Object.fromEntries(
                        Object.entries(parsedData).filter(([key, value]) => value)
                    );

                    setCardData(filteredData); // Set filtered card data
                } else {
                    setExtractedText('No text detected.');
                    setCardData({});
                }
            };

            reader.onerror = (fileError) => {
                throw new Error('Error reading the image file.');
            };

            reader.readAsDataURL(imageFile); // Pass the file to FileReader
        } catch (apiError) {
            clearTimeout(timeoutId); // Clear timeout on error
            console.error('Error:', apiError);
            setError(`Error processing image: ${apiError.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gray-100 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden md:max-w-md">
                <div className="md:flex">
                    <div className="p-8">
                        <h1 className="block mt-1 text-lg leading-tight font-semibold text-gray-800 text-center">
                            Business Card Data Extractor
                        </h1>

                        <div className="mt-4 flex justify-center">
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileUpload}
                                accept="image/*"
                                className="hidden"
                                capture="camera"  // This triggers the camera on mobile devices
                            />
                            <button
                                onClick={() => fileInputRef.current.click()}
                                className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                disabled={loading}
                            >
                                <Camera className="mr-2" size={18} />
                                {loading ? (
                                    <div className="spinner-border animate-spin inline-block w-4 h-4 border-2 border-t-transparent border-blue-600 rounded-full"></div>
                                ) : 'Upload or Capture Card'}
                            </button>
                        </div>

                        {imageFile && (
                            <div className="mt-6">
                                <div className="aspect-w-16 aspect-h-9">
                                    <img
                                        src={URL.createObjectURL(imageFile)}
                                        alt="Uploaded Card"
                                        className="object-cover rounded-md shadow-md"
                                    />
                                </div>
                                <button
                                    onClick={processImage}
                                    className="mt-4 w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <div className="spinner-border animate-spin inline-block w-4 h-4 border-2 border-t-transparent border-blue-600 rounded-full"></div>
                                    ) : 'Extract Text'}
                                </button>
                            </div>
                        )}

                        {error && (
                            <div className="mt-6 rounded-md bg-red-50 p-4">
                                <div className="flex">
                                    <div className="ml-3">
                                        <h3 className="text-sm font-medium text-red-800">Error</h3>
                                        <div className="mt-2 text-sm text-red-700">
                                            <p>{error}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {Object.keys(cardData).length > 0 && (
                            <div className="mt-6 rounded-md bg-gray-50 p-4">
                                <h3 className="text-lg font-semibold text-gray-800">Extracted Data:</h3>
                                {Object.entries(cardData).map(([key, value]) => (
                                    <div key={key} className="mt-4 p-4 bg-white shadow-sm rounded-lg flex items-center">
                                        {key === 'PhoneNumber' && <Phone className="mr-2 text-gray-600" />}
                                        {key === 'Email' && <Mail className="mr-2 text-gray-600" />}
                                        {key === 'Address' && <MapPin className="mr-2 text-gray-600" />}
                                        {key === 'Website' && <Globe className="mr-2 text-gray-600" />}
                                        {key === 'Name' && <UserCircle className="mr-2 text-gray-600" />}
                                        <div>
                                            <h4 className="font-medium text-gray-700">{key}:</h4>
                                            <p className="text-gray-600">{value}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Convert;
