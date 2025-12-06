import React, { useState } from "react";
import "./CreateEvent.css";

const Grouping = ({ onBack, onNext }) => {
    const [groups, setGroups] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [groupName, setGroupName] = useState("");

    const handleSave = () => {
        // Save logic will be implemented later
        onNext();
    };

    const handleAddGroup = () => {
        setShowModal(true);
    };

    const handleSaveGroup = () => {
        if (groupName.trim()) {
            setGroups([...groups, { id: Date.now(), name: groupName }]);
            setGroupName("");
            setShowModal(false);
        }
    };

    const handleCancelModal = () => {
        setGroupName("");
        setShowModal(false);
    };

    return (
        <div className="event-form-section">
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 24,
                }}
            >
                <h3 style={{ fontWeight: 700, fontSize: "1.6rem", margin: 0 }}>
                    Grouping
                </h3>
                <button
                    style={{
                        border: "1.5px solid #da251c",
                        color: "#da251c",
                        background: "#fff",
                        borderRadius: 6,
                        padding: "8px 22px",
                        fontWeight: 600,
                        fontSize: "1rem",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#000";
                        e.currentTarget.style.color = "#fff";
                        e.currentTarget.style.border = "1.5px solid #000";
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = "#fff";
                        e.currentTarget.style.color = "#da251c";
                        e.currentTarget.style.border = "1.5px solid #da251c";
                    }}
                    onClick={handleAddGroup}
                >
                    + Add Group
                </button>
            </div>

            {/* Modal */}
            {showModal && (
                <div
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: "rgba(0, 0, 0, 0.5)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 1000,
                    }}
                    onClick={handleCancelModal}
                >
                    <div
                        style={{
                            background: "#fff",
                            borderRadius: 12,
                            padding: 32,
                            width: "90%",
                            maxWidth: 500,
                            boxShadow: "0 4px 24px rgba(0,0,0,0.15)",
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3
                            style={{
                                fontWeight: 700,
                                fontSize: "1.4rem",
                                marginBottom: 24,
                                color: "#333",
                            }}
                        >
                            Add Group
                        </h3>

                        <div style={{ marginBottom: 24 }}>
                            <label
                                style={{
                                    display: "block",
                                    fontWeight: 600,
                                    marginBottom: 8,
                                    color: "#333",
                                }}
                            >
                                Enter Group Name
                            </label>
                            <input
                                type="text"
                                value={groupName}
                                onChange={(e) => setGroupName(e.target.value)}
                                placeholder="Group Name"
                                style={{
                                    width: "100%",
                                    padding: "10px 14px",
                                    border: "1.5px solid #ddd",
                                    borderRadius: 6,
                                    fontSize: "1rem",
                                    outline: "none",
                                }}
                                onKeyPress={(e) => {
                                    if (e.key === "Enter") handleSaveGroup();
                                }}
                            />
                        </div>

                        <div
                            style={{
                                display: "flex",
                                justifyContent: "flex-end",
                                gap: 12,
                            }}
                        >
                            <button
                                onClick={handleCancelModal}
                                style={{
                                    background: "#fff",
                                    border: "1.5px solid #da251c",
                                    color: "#da251c",
                                    borderRadius: 6,
                                    padding: "10px 24px",
                                    fontWeight: 600,
                                    fontSize: "1rem",
                                    cursor: "pointer",
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveGroup}
                                style={{
                                    background: "#da251c",
                                    border: "none",
                                    color: "#fff",
                                    borderRadius: 6,
                                    padding: "10px 24px",
                                    fontWeight: 600,
                                    fontSize: "1rem",
                                    cursor: "pointer",
                                }}
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Groups Display */}
            <div
                style={{
                    background: "#fff",
                    borderRadius: 16,
                    boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
                    padding: 32,
                    minHeight: 300,
                }}
            >
                {groups.length === 0 ? (
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            minHeight: 236,
                            color: "#666",
                            fontSize: "1.1rem",
                            textAlign: "center",
                        }}
                    >
                        <div>
                            <i
                                className="fas fa-layer-group"
                                style={{ fontSize: "3rem", color: "#da251c", marginBottom: 16 }}
                            ></i>
                            <p>No groups added yet. Click "Add Group" to get started.</p>
                        </div>
                    </div>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                        {groups.map((group) => (
                            <div
                                key={group.id}
                                style={{
                                    border: "1.5px solid transparent",
                                    borderRadius: 12,
                                    padding: "24px 20px",
                                    display: "flex",
                                    marginTop: "12px",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    background: "#fff",
                                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
                                    transition: "all 0.2s ease",
                                    position: "relative",
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.border = "1.5px solid #da251c";
                                    e.currentTarget.style.boxShadow = "0 4px 16px rgba(0, 0, 0, 0.2)";
                                    const icons = e.currentTarget.querySelector('.group-icons');
                                    if (icons) icons.style.opacity = "1";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.border = "1.5px solid transparent";
                                    e.currentTarget.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.2)";
                                    const icons = e.currentTarget.querySelector('.group-icons');
                                    if (icons) icons.style.opacity = "0";
                                }}
                            >
                                <span
                                    style={{
                                        fontWeight: 600,
                                        fontSize: "1.1rem",
                                        color: "#333",
                                    }}
                                >
                                    {group.name}
                                </span>

                                {/* Edit and Delete Icons - appear on hover */}
                                <div
                                    className="group-icons"
                                    style={{
                                        position: "absolute",
                                        top: -20,
                                        right: 12,
                                        display: "flex",
                                        gap: 8,
                                        opacity: 0,
                                        transition: "opacity 0.2s ease",
                                    }}
                                >
                                    <button
                                        style={{
                                            width: 32,
                                            height: 32,
                                            borderRadius: 6,
                                            border: "1.5px solid #da251c",
                                            background: "#fff",
                                            color: "#da251c",
                                            cursor: "pointer",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                        }}
                                        onClick={() => {
                                            // Edit functionality will be implemented later
                                            alert("Edit functionality coming soon!");
                                        }}
                                        title="Edit"
                                    >
                                        <i className="fas fa-edit"></i>
                                    </button>
                                    <button
                                        style={{
                                            width: 32,
                                            height: 32,
                                            borderRadius: 6,
                                            border: "1.5px solid #da251c",
                                            background: "#fff",
                                            color: "#da251c",
                                            cursor: "pointer",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                        }}
                                        onClick={() => {
                                            // Delete functionality
                                            const confirmDelete = window.confirm(`Are you sure you want to delete "${group.name}"?`);
                                            if (confirmDelete) {
                                                setGroups(groups.filter(g => g.id !== group.id));
                                            }
                                        }}
                                        title="Delete"
                                    >
                                        <i className="fas fa-trash"></i>
                                    </button>
                                </div>

                                <button
                                    style={{
                                        border: "1.5px solid #da251c",
                                        color: "#da251c",
                                        background: "#fff",
                                        borderRadius: 6,
                                        padding: "8px 18px",
                                        fontWeight: 600,
                                        fontSize: "0.95rem",
                                        cursor: "pointer",
                                    }}
                                    onClick={() => {
                                        // Add question functionality will be implemented later
                                        alert("Add Question functionality coming soon!");
                                    }}
                                >
                                    + Add Question
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Navigation Buttons */}
            <div
                style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: 12,
                    marginTop: 24,
                }}
            >
                <button
                    onClick={onBack}
                    style={{
                        border: "1.5px solid #da251c",
                        color: "#da251c",
                        background: "#fff",
                        borderRadius: 6,
                        padding: "10px 32px",
                        fontWeight: 600,
                        fontSize: "1.1rem",
                        cursor: "pointer",
                    }}
                >
                    Back
                </button>
                <button
                    className="next-btn"
                    onClick={onNext}
                    style={{
                        background: "#da251c",
                        color: "#fff",
                        border: "none",
                        borderRadius: 6,
                        padding: "10px 32px",
                        fontWeight: 600,
                        fontSize: "1.1rem",
                        cursor: "pointer",
                    }}
                >
                    Save & Next (6/11)
                </button>
            </div>
        </div>
    );
};

export default Grouping;
