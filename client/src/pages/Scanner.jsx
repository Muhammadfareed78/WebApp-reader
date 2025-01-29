import React, { useState } from "react";

function Scanner() {
    const [image, setImage] = useState(null);
    const [data, setData] = useState({
        name: "",
        address: "",
        email: "",
        phone: "",
        website: "",
    });

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => setImage(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        try {
            const response = await fetch("http://localhost:5000/api/cards", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ ...data, image }),
            });

            if (!response.ok) throw new Error("Failed to save card");
            alert("Card saved successfully!");
        } catch (err) {
            console.error("Error saving card:", err);
        }
    };

    return (
        <div id="scannerSection">
            <div className="camera-section">
                <div className="preview-container">
                    {image ? (
                        <img id="previewImage" src={image} alt="Captured business card" />
                    ) : (
                        <p>No image uploaded</p>
                    )}
                </div>
                <input
                    type="file"
                    accept="image/*"
                    id="fileInput"
                    onChange={handleImageUpload}
                />
                <button className="button" onClick={handleSave}>
                    Save Card
                </button>
            </div>

            <div className="data-section">
                <div className="data-field">
                    <label>Name</label>
                    <input
                        type="text"
                        value={data.name}
                        onChange={(e) => setData({ ...data, name: e.target.value })}
                    />
                </div>
                <div className="data-field">
                    <label>Address</label>
                    <input
                        type="text"
                        value={data.address}
                        onChange={(e) => setData({ ...data, address: e.target.value })}
                    />
                </div>
                <div className="data-field">
                    <label>Email</label>
                    <input
                        type="email"
                        value={data.email}
                        onChange={(e) => setData({ ...data, email: e.target.value })}
                    />
                </div>
                <div className="data-field">
                    <label>Phone</label>
                    <input
                        type="tel"
                        value={data.phone}
                        onChange={(e) => setData({ ...data, phone: e.target.value })}
                    />
                </div>
                <div className="data-field">
                    <label>Website</label>
                    <input
                        type="url"
                        value={data.website}
                        onChange={(e) => setData({ ...data, website: e.target.value })}
                    />
                </div>
            </div>
        </div>
    );
}

export default Scanner;



// import React, { useState } from "react";
// import Scanner from "./pages/Scanner";
// import SavedCards from "./pages/SavedCard";

// function App() {
//     const [activeTab, setActiveTab] = useState("scanner");

//     return (
//         <div className="App">
//             <h1>Business Card Scanner</h1>
//             <div className="tabs">
//                 <button onClick={() => setActiveTab("scanner")}>
//                     Scanner
//                 </button>
//                 <button onClick={() => setActiveTab("saved")}>
//                     Saved Cards
//                 </button>
//             </div>
//             {activeTab === "scanner" ? <Scanner /> : <SavedCards />}
//         </div>
//     );
// }

// export default App;
