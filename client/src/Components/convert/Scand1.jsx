// import React, { useState, useRef } from "react";
// import { Camera, AlertCircle, Loader2 } from "lucide-react";
// import { MapPin, Mail, Phone, Globe, Building, User } from "lucide-react"; // Icons for extracted data

// const API_KEY = "AIzaSyAUxh7O4TpsjC7ZaDaIkrmvkCCijTmT_pg"; // Replace with your Google Vision API key
// const API_ENDPOINT = `https://vision.googleapis.com/v1/images:annotate?key=${API_KEY}`;
// const API_TIMEOUT_MS = 10000;

// const BusinessCardExtractor = () => {
//   const [imageFile, setImageFile] = useState(null);
//   const [cardData, setCardData] = useState({});
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const fileInputRef = useRef(null);

//   const handleFileUpload = (event) => {
//     const file = event.target.files[0];
//     if (file) {
//       setImageFile(file);
//       setCardData({});
//       setError(null);
//     }
//   };

//   const processImage = async () => {
//     if (!imageFile) {
//       alert("Please upload a business card image first.");
//       return;
//     }

//     setLoading(true);
//     setError(null);

//     const abortController = new AbortController();
//     const timeoutId = setTimeout(() => abortController.abort(), API_TIMEOUT_MS);

//     try {
//       const reader = new FileReader();

//       reader.onloadend = async () => {
//         const base64ImageContent = reader.result.split(",")[1];

//         const requestBody = {
//           requests: [
//             {
//               image: { content: base64ImageContent },
//               features: [{ type: "DOCUMENT_TEXT_DETECTION" }],
//             },
//           ],
//         };

//         const response = await fetch(API_ENDPOINT, {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify(requestBody),
//           signal: abortController.signal,
//         });

//         clearTimeout(timeoutId);

//         if (!response.ok) {
//           const errorData = await response.json();
//           throw new Error(
//             `Vision API request failed with status ${response.status}: ${
//               errorData?.error?.message || response.statusText
//             }`
//           );
//         }

//         const responseData = await response.json();
//         const fullTextAnnotation = responseData.responses[0]?.fullTextAnnotation;

//         if (fullTextAnnotation) {
//           const text = fullTextAnnotation.text || "";
//           const extractedData = await extractDataFromText(text); // Process raw text
//           setCardData(extractedData);
//         } else {
//           setCardData({});
//           throw new Error("No text detected in the image.");
//         }
//       };

//       reader.onerror = () => {
//         throw new Error("Error reading the image file.");
//       };

//       reader.readAsDataURL(imageFile);
//     } catch (apiError) {
//       clearTimeout(timeoutId);
//       setError(`Error processing image: ${apiError.message}`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const extractDataFromText = (text) => {
//     // Initialize empty fields
//     const data = {
//       Name: "",
//       CompanyName: "",
//       Email: "",
//       PhoneNumber: "",
//       Address: "",
//       Website: "",
//     };

//     // Split text into lines for processing
//     const lines = text.split("\n").map((line) => line.trim()).filter((line) => line.length > 0);

//     // Process lines based on assumptions (No Regex)

//     // First line as Name (This could be adjusted as per the structure of text in the card)
//     data.Name = lines[0] || "";

//     // Check for company name (Look for words that seem like company names)
//     const companyLine = lines.find((line) => line.includes("Inc") || line.includes("Ltd") || line.includes("LLC") || line.includes("Corp"));
//     data.CompanyName = companyLine || "";

//     // Extract Email (if present in the extracted text)
//     const emailMatch = text.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/);
//     data.Email = emailMatch ? emailMatch[0] : "";

//     // Extract Phone number (if present in the extracted text)
//     const phoneMatch = text.match(
//       /(\+?\d{1,4}[-.\s]?)?\(?\d{2,5}\)?[-.\s]?\d{3,5}[-.\s]?\d{3,5}/
//     );
//     data.PhoneNumber = phoneMatch ? phoneMatch[0] : "";

//     // Extract Website URL (if present in the extracted text)
//     const websiteMatch = text.match(/(https?:\/\/[^\s]+|www\.[^\s]+)/);
//     data.Website = websiteMatch ? websiteMatch[0] : "";

//     // Extract Address (You could use a simple fallback for now)
//     const addressLine = lines.slice(-2).join(", ");
//     data.Address = addressLine || "";

//     return data;
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-r from-indigo-600 to-purple-600 py-12 px-4 sm:px-6 lg:px-8">
//       <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
//         <div className="p-8">
//           <h1 className="text-2xl font-bold text-center text-indigo-700">
//             Business Card Data Extractor
//           </h1>

//           <div className="mt-6 text-center">
//             <input
//               type="file"
//               ref={fileInputRef}
//               onChange={handleFileUpload}
//               accept="image/*"
//               className="hidden"
//             />
//             <button
//               onClick={() => fileInputRef.current.click()}
//               className={`bg-indigo-600 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-indigo-700 transition duration-300 ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
//               disabled={loading}
//             >
//               <Camera className="inline mr-2" />
//               {loading ? "Processing..." : "Upload Card"}
//             </button>
//           </div>

//           {imageFile && (
//             <div className="mt-6">
//               <img
//                 src={URL.createObjectURL(imageFile)}
//                 alt="Uploaded Card"
//                 className="rounded-lg shadow-lg"
//               />
//               <button
//                 onClick={processImage}
//                 className="mt-4 w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 shadow-lg"
//                 disabled={loading}
//               >
//                 {loading ? <Loader2 className="inline mr-2 animate-spin" /> : "Extract Text"}
//               </button>
//             </div>
//           )}

//           {error && (
//             <div className="mt-4 p-4 bg-red-100 rounded-lg">
//               <AlertCircle className="inline text-red-600" /> {error}
//             </div>
//           )}

//           {Object.keys(cardData).length > 0 && (
//             <div className="mt-6 rounded-md bg-gray-50 p-4">
//               <h3 className="text-lg font-semibold text-gray-800">Extracted Data:</h3>
//               {Object.entries(cardData).map(([key, value]) => {
//                 const iconMap = {
//                   Name: <User className="text-indigo-600 mr-2" size={18} />,
//                   CompanyName: <Building className="text-indigo-600 mr-2" size={18} />,
//                   Email: <Mail className="text-indigo-600 mr-2" size={18} />,
//                   PhoneNumber: <Phone className="text-indigo-600 mr-2" size={18} />,
//                   Address: <MapPin className="text-indigo-600 mr-2" size={18} />,
//                   Website: <Globe className="text-indigo-600 mr-2" size={18} />,
//                 };

//                 return (
//                   <div key={key} className="mt-4 p-4 bg-white shadow-sm rounded-lg flex items-center">
//                     {iconMap[key] || null}
//                     <div>
//                       <h4 className="font-medium text-gray-700">{key}:</h4>
//                       <p className="text-gray-600">{value}</p>
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default BusinessCardExtractor;
