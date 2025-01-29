import React, { useEffect, useState } from "react";

function SavedCards() {
    const [cards, setCards] = useState([]);

    useEffect(() => {
        fetch("http://localhost:5000/api/cards")
            .then((response) => response.json())
            .then((data) => setCards(data))
            .catch((err) => console.error("Error fetching cards:", err));
    }, []);

    const handleDelete = async (id) => {
        try {
            const response = await fetch(`http://localhost:5000/api/cards/${id}`, {
                method: "DELETE",
            });

            if (!response.ok) throw new Error("Failed to delete card");
            setCards(cards.filter((card) => card._id !== id));
        } catch (err) {
            console.error("Error deleting card:", err);
        }
    };

    return (
        <div>
            {cards.length === 0 ? (
                <p className="empty-state">No saved cards yet.</p>
            ) : (
                <div className="saved-cards">
                    {cards.map((card) => (
                        <div key={card._id} className="card-item">
                            <h3>{card.name || "Unnamed Card"}</h3>
                            <img
                                src={card.image}
                                alt="Business card"
                                style={{ maxWidth: "200px", marginBottom: "10px" }}
                            />
                            <p>{card.address}</p>
                            <p>{card.email}</p>
                            <p>{card.phone}</p>
                            <p>{card.website}</p>
                            <button
                                className="button delete-button"
                                onClick={() => handleDelete(card._id)}
                            >
                                Delete
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default SavedCards;
