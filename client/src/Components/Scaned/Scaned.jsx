// import React, { useState, useRef } from 'react';
// import { Camera } from 'lucide-react';
// import Tesseract from 'tesseract.js';


// const Scaned = () => {
//   const [imageFile, setImageFile] = useState(null);
//   const [extractedText, setExtractedText] = useState('');
//   const [cardData, setCardData] = useState({
//     name: '',
//     email: '',
//     phone: '',
//     address: '',
//     website: ''
//   });
//   const fileInputRef = useRef(null);
//   const [loading, setLoading] = useState(false);

//   const handleFileUpload = async (event) => {
//     const file = event.target.files[0];
//     if (file) {
//       const imageUrl = URL.createObjectURL(file);
//       setImageFile(imageUrl);
//       setLoading(true); // Start loader
  
//       try {
//         const { data } = await Tesseract.recognize(file, 'eng', { logger: (m) => console.log(m) });
//         setExtractedText(data.text);
//         extractInformation(data.text);
//       } catch (error) {
//         console.error("Error during OCR:", error);
//         alert("Error processing the image. Please try again.");
//       } finally {
//         setLoading(false); // Stop loader
//       }
//     }
//   };
  
//   const extractInformation = (text) => {
//     console.log("Extracted Text:", text);  // Log the text for inspection
//     const extractedData = {
//       name: extractName(text),
//       companyName: extractCompanyName(text),
//       email: extractEmail(text),
//       phone: extractPhone(text),
//       address: extractAddress(text),  // This is where address is being extracted
//       website: extractWebsite(text),
//     };

//     setCardData(extractedData);
// };

// const extractName = (text) => {
//     const namePatterns = [
//         // Pattern 1: Full names with first, middle (optional), and last names (e.g., "John A. Doe", "Mary Jane Smith")
//         /\b([A-Z][a-z]+(?:\s[A-Z]\.)?(?:\s[A-Z][a-z]+)?)\b/, 

//         // Pattern 2: Names with compound structures (e.g., "Mary-Jane O'Connor", "Jean-Paul Gaultier")
//         /\b([A-Z][a-z]+(?:[-'][A-Za-z]+)?(?:\s[A-Z][a-z]+(?:[-'][A-Za-z]+)?)?)\b/,

//         // Pattern 3: Titles followed by names (e.g., "Dr. John Doe", "Mr. David Brown")
//         /\b(?:Dr|Mr|Mrs|Ms|Miss|Prof)\.?(\s[A-Z][a-z]+(?:\s[A-Z][a-z]+)?)\b/,

//         // Pattern 4: Names with suffixes (e.g., "John Doe Jr.", "Jane Smith III")
//         /\b([A-Z][a-z]+(?:\s[A-Z][a-z]+)*(?:\s(Jr|Sr|II|III|IV|Esq))?)\b/
//     ];

//     for (let pattern of namePatterns) {
//         const match = text.match(pattern);
//         if (match) return match[0].trim();
//     }

//     return ''; // Return empty string if no name is found
// };


    
// const extractCompanyName = (text) => {
//     const companyPatterns = [
//         // Pattern 1: Company names with common suffixes (e.g., "Tech Solutions Inc.", "Google LLC")
//         /\b([A-Z][a-zA-Z0-9&'"\-\.]+(?:\s[A-Z][a-zA-Z0-9&'"\-\.]+)*\s(?:Inc|Ltd|LLC|Corp|Corporation|Group|Technologies|Solutions|Enterprises|Partners|Associates|Firm|International|Industries|Consulting|Services|Pvt\.? Ltd\.?))\b/,

//         // Pattern 2: Standalone company names (e.g., "Google", "Apple", "Microsoft")
//         /\b([A-Z][a-zA-Z0-9&'"\-\.]+(?:\s[A-Z][a-zA-Z0-9&'"\-\.]+)*)\b/,

//         // Pattern 3: Company abbreviations (e.g., "IBM", "TCS", "HCL")
//         /\b([A-Z]{2,5})\b/,

//         // Pattern 4: Complex names with commas or special characters (e.g., "Johnson & Johnson, Inc.")
//         /\b([A-Z][a-zA-Z0-9&'"\-\.]+(?:\s[A-Z][a-zA-Z0-9&'"\-\.]+)*(?:,\s?(?:Inc|Ltd|LLC|Co\.?|Group))?)\b/
//     ];

//     for (let pattern of companyPatterns) {
//         const match = text.match(pattern);
//         if (match) return match[0].replace(/\s{2,}/g, ' ').trim(); // Normalize spaces and return
//     }

//     return ''; // Return empty string if no company name is found
// };


  
  
//   const extractEmail = (text) => {
//     const emailRegex =  /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi;
//     const matches = text.match(emailRegex);
//     return matches ? matches[0].trim() : ''; 
//   };
  
  
//   const extractPhone = (text) => {
//     const phonePatterns = [
//       /\+?[1-9]{1,3}[-.\s]?\(?[0-9]{1,4}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}/, 
//     ];
  
//     for (let pattern of phonePatterns) {
//       const match = text.match(pattern);
//       if (match) return match[0].replace(/\D/g, ''); // Return digits only
//     }
//     return '';
//   };
  
//   const extractWebsite = (text) => {
//     const websiteRegex = /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,})/gi;
//     const matches = text.match(websiteRegex);
//     return matches ? matches[0].trim() : ''; // Return the first valid website found
//   };
  
  
  
//   const extractAddress = (text) => {
//     // Clean up the text to remove excessive spaces and newlines
//     const cleanText = text.replace(/\s+/g, ' ').replace(/\n/g, ' ').trim();  
//     console.log("Cleaned Text for Address:", cleanText);  // Log cleaned text

//     // Patterns for addresses with frequent commas
//     const addressPatterns = [
//         // Pattern 1: Match full addresses with commas separating components (e.g., "123 Main St, Springfield, IL 62704")
//         /\d+\s+[A-Za-z0-9\s,-]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr|Terrace|Tce|Place|Pl|Court|Ct|Circle|Cir)?\s*,\s*[A-Za-z\s]+,\s*[A-Za-z]{2}\s*\d{5}(?:-\d{4})?/i,

//         // Pattern 2: Match simple city, state, and zip with commas (e.g., "New York, NY, 10001")
//         /\b[A-Za-z\s]+,\s?[A-Za-z]{2},\s?\d{5}(?:-\d{4})?\b/,  

//         // Pattern 3: Match less formal international-style addresses with commas (e.g., "Baker Street, London, UK")
//         /\d+\s+[A-Za-z\s]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr|Terrace|Tce|Place|Pl|Court|Ct|Circle|Cir)[\s,]+[A-Za-z\s,]+/i,

//         // Pattern 4: Match keywords like "office" or "address" followed by components with commas
//         /(?:office|location|address|suite|block)[\s:]*[A-Za-z0-9\s,.-]+/i
//     ];

//     // Loop through patterns to find a match
//     for (let pattern of addressPatterns) {
//         const match = cleanText.match(pattern);
//         if (match) {
//             console.log(`Address matched: ${match[0]}`);  // Log matched address
//             return match[0].trim();  // Return matched address
//         }
//     }

//     return '';  // Return empty string if no address found
// };


  
  
  
  
  
  

  

//   return (
//     <div className="max-w-xl mx-auto p-6 bg-gray-50 min-h-screen">
//       <div className="bg-white shadow-lg rounded-2xl p-8">
//         <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
//           Business Card Extractor
//         </h1>

//         <div className="mb-6 flex justify-center">
//   <input 
//     type="file" 
//     ref={fileInputRef}
//     onChange={handleFileUpload}
//     accept="image/*"
//     className="hidden"
//   />
//   <button 
//     onClick={() => fileInputRef.current.click()}
//     className={`flex items-center justify-center 
//       bg-blue-600 text-white 
//       px-6 py-3 rounded-lg 
//       hover:bg-blue-700 
//       transition duration-300 
//       shadow-md ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
//     disabled={loading} // Button disabled when loading
//   >
//     <Camera className="mr-3" size={24} />
//     {loading ? 'Processing...' : 'Upload Business Card'}
//   </button>
// </div>

// {loading && (
//   <div className="flex justify-center items-center my-4">
//     <svg
//       className="animate-spin h-8 w-8 text-blue-600"
//       xmlns="http://www.w3.org/2000/svg"
//       fill="none"
//       viewBox="0 0 24 24"
//     >
//       <circle
//         className="opacity-25"
//         cx="12"
//         cy="12"
//         r="10"
//         stroke="currentColor"
//         strokeWidth="4"
//       ></circle>
//       <path
//         className="opacity-75"
//         fill="currentColor"
//         d="M4 12a8 8 0 018-8v8H4z"
//       ></path>
//     </svg>
//     <span className="ml-2 text-blue-600 text-lg font-medium">Processing...</span>
//   </div>
// )}


//         {imageFile && (
//           <div className="mb-6 flex justify-center">
//             <img 
//               src={imageFile} 
//               alt="Uploaded Card" 
//               className="max-w-full h-auto max-h-64 rounded-lg shadow-md"
//             />
//           </div>
//         )}

//         <div className="bg-gray-100 rounded-lg p-6">
//   <h2 className="text-2xl font-semibold mb-6 text-gray-700">
//     Extracted Information
//   </h2>

//   {/* Render Each Extracted Data Block Separately */}
//   {Object.entries(cardData)
//   .filter(([_, value]) => value)  // Show only non-empty values
//   .map(([key, value]) => (
//     <div key={key} className="mb-4 pb-4 border-b border-gray-200 last:border-b-0">
//       <label className="block text-sm font-medium text-gray-600 mb-2 capitalize">
//         {key.replace(/([A-Z])/g, ' $1')} {/* Convert camelCase to readable text */}
//       </label>
//       <div className="text-lg font-bold text-gray-800">
//         {value}
//       </div>
//     </div>
// ))}

//         </div>

// {extractedText && (
//     <div className="mt-6 bg-gray-100 p-4 rounded-lg">
//       <h3 className="text-xl font-semibold mb-4 text-gray-700">
//         Raw Card Data
//       </h3>
//       <pre className="whitespace-pre-wrap break-words text-sm text-gray-600">
//         {extractedText}
//       </pre>
//     </div>
//   )}
// </div>
//     </div>
//   );
// };

// export default Scaned;