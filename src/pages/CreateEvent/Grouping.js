import React, { useState, useEffect } from "react";
import { authAPI } from "../../services/authAPI";
import "./CreateEvent.css";
import Toast from "../../components/Toast/Toast";
import HelpIcon from "../../components/HelpModal/HelpIcon";
import { helpContent } from "../../utils/HelpContent";

const Grouping = ({ onBack, onNext, isReadOnly }) => {
    const [groups, setGroups] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [groupName, setGroupName] = useState("");
    const [loading, setLoading] = useState(false);
    const [fetchingGroups, setFetchingGroups] = useState(true);
    const [eventId, setEventId] = useState(null);
    const [editingGroupId, setEditingGroupId] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);

    // Questions modal state
    const [showQuestionsModal, setShowQuestionsModal] = useState(false);
    const [selectedGroupId, setSelectedGroupId] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [selectedQuestions, setSelectedQuestions] = useState([]);
    const [loadingQuestions, setLoadingQuestions] = useState(false);
    const [addingQuestions, setAddingQuestions] = useState(false);

    // Confirmation modal state
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmModalData, setConfirmModalData] = useState({ questionId: null, fromGroup: "", toGroup: "" });

    // Drag and drop state for group reordering
    const [draggedGroupIndex, setDraggedGroupIndex] = useState(null);
    const [draggedOverIndex, setDraggedOverIndex] = useState(null);
    const [toast, setToast] = useState(null);

    const triggerToast = (message, type = 'success') => {
        setToast({ message, type });
    };

    const handleSave = () => {
        // Save logic will be implemented later
        onNext();
    };

    const handleAddGroup = () => {
        setIsEditMode(false);
        setEditingGroupId(null);
        setGroupName("");
        setShowModal(true);
    };

    const handleEditGroup = (groupId, groupName) => {
        setIsEditMode(true);
        setEditingGroupId(groupId);
        setGroupName(groupName);
        setShowModal(true);
    };

    const handleSaveGroup = async () => {
        if (groupName.trim()) {
            setLoading(true);
            try {
                if (isEditMode && editingGroupId) {
                    // Update existing group
                    const response = await authAPI.updateGroupQuestion({
                        id: editingGroupId,
                        title: groupName.trim()
                    });
                    console.log("Update Group Response:", response);
                } else {
                    // Create new group
                    const response = await authAPI.createGroupQuestion({
                        title: groupName.trim()
                    });
                    console.log("Create Group Response:", response);
                }

                // Fetch updated groups list to get the correct data
                await fetchGroupQuestions();
                
                triggerToast(isEditMode ? "Group updated successfully!" : "Group created successfully!");

                setGroupName("");
                setIsEditMode(false);
                setEditingGroupId(null);
                setShowModal(false);
            } catch (error) {
                console.error(isEditMode ? "Error updating group:" : "Error creating group:", error);
                triggerToast(isEditMode ? "Failed to update group. Please try again." : "Failed to create group. Please try again.", 'error');
            } finally {
                setLoading(false);
            }
        }
    };

    const fetchGroupQuestions = async () => {
        try {
            setFetchingGroups(true);
            const response = await authAPI.getGroupQuestions();
            console.log("Get Groups Response:", response);
            console.log("Get Groups Response Data:", response.data);

            // Adjust based on actual API response structure
            if (response && response.data) {
                const groupsData = Array.isArray(response.data) ? response.data : [];
                console.log("Groups Data Array:", groupsData);

                const mappedGroups = groupsData.map(group => {
                    // Try different possible ID fields
                    const groupId = group.id || group.group_id || group.question_group_id;
                    console.log("Mapping group:", {
                        originalId: group.id,
                        groupId: group.group_id,
                        mappedId: groupId,
                        title: group.title
                    });

                    return {
                        id: groupId,
                        name: group.title || group.name,
                        questions: group.questions || []
                    };
                });

                console.log("Mapped Groups:", mappedGroups);
                setGroups(mappedGroups);
            }
        } catch (error) {
            console.error("Error fetching groups:", error);
        } finally {
            setFetchingGroups(false);
        }
    };

    const handleCancelModal = () => {
        setGroupName("");
        setIsEditMode(false);
        setEditingGroupId(null);
        setShowModal(false);
    };

    // Fetch event form questions
    const fetchEventFormQuestions = async () => {
        try {
            setLoadingQuestions(true);

            if (!eventId) {
                console.error("Event ID not found");
                triggerToast("Event ID not found. Please try again.", 'error');
                return;
            }

            const formData = new FormData();
            formData.append("event_id", eventId);

            console.log("Fetching questions for event_id:", eventId);
            const response = await authAPI.eventFormQuestions(formData);
            console.log("Event Form Questions Response:", response);

            // Parse the nested response structure
            let questionsData = [];

            if (response && response.data && response.data.form_question) {
                // Try to get from event_form_array first
                if (response.data.form_question.event_form_array &&
                    Array.isArray(response.data.form_question.event_form_array)) {
                    questionsData = response.data.form_question.event_form_array;
                }
                // Fallback to event_form_details if event_form_array is empty
                else if (response.data.form_question.event_form_details) {
                    const formDetails = response.data.form_question.event_form_details;
                    // Flatten all form categories into one array
                    Object.keys(formDetails).forEach(formKey => {
                        if (Array.isArray(formDetails[formKey])) {
                            questionsData = [...questionsData, ...formDetails[formKey]];
                        }
                    });
                }
            }

            console.log("Parsed questions data:", questionsData);
            setQuestions(questionsData);

        } catch (error) {
            console.error("Error fetching questions:", error);
            triggerToast("Failed to fetch questions. Please try again.", 'error');
        } finally {
            setLoadingQuestions(false);
        }
    };

    // Handle add question button click
    const handleAddQuestion = async (groupId) => {
        setSelectedGroupId(groupId);
        setShowQuestionsModal(true);

        // Fetch questions first
        await fetchEventFormQuestions();

        // After questions are loaded, pre-select questions already in this group
        // We'll do this in a useEffect or after the fetch completes
    };

    // Handle question checkbox toggle
    const handleQuestionToggle = (questionId) => {
        // Find the question to check if it's in a different group
        const question = questions.find(q =>
            (q.id || q.question_id || q.form_question_id) === questionId
        );

        if (question) {
            const questionGroup = question.question_group || question.group_id;
            const isInDifferentGroup = questionGroup &&
                questionGroup.toString() !== selectedGroupId.toString() &&
                questionGroup.toString() !== "0";

            // If trying to select a question from a different group, show confirmation
            if (isInDifferentGroup && !selectedQuestions.includes(questionId)) {
                const assignedGroup = groups.find(g => g.id.toString() === questionGroup.toString());
                const assignedGroupName = assignedGroup?.name || "another group";
                const currentGroup = groups.find(g => g.id.toString() === selectedGroupId.toString());
                const currentGroupName = currentGroup?.name || "this group";

                // Show custom confirmation modal
                setConfirmModalData({
                    questionId: questionId,
                    fromGroup: assignedGroupName,
                    toGroup: currentGroupName
                });
                setShowConfirmModal(true);
                return; // Don't toggle yet, wait for confirmation
            }
        }

        // Proceed with toggle
        setSelectedQuestions(prev => {
            if (prev.includes(questionId)) {
                return prev.filter(id => id !== questionId);
            } else {
                return [...prev, questionId];
            }
        });
    };

    // Handle confirmation modal OK
    const handleConfirmOk = () => {
        const { questionId } = confirmModalData;
        // Add the question to selected questions
        setSelectedQuestions(prev => [...prev, questionId]);
        setShowConfirmModal(false);
        setConfirmModalData({ questionId: null, fromGroup: "", toGroup: "" });
    };

    // Handle confirmation modal Cancel
    const handleConfirmCancel = () => {
        setShowConfirmModal(false);
        setConfirmModalData({ questionId: null, fromGroup: "", toGroup: "" });
    };


    // Handle add selected questions to group
    const handleAddQuestionsToGroup = async () => {
        if (!eventId) {
            triggerToast("Event ID not found. Please try again.", 'error');
            return;
        }

        setAddingQuestions(true);
        try {
            // Prepare the FormData payload for API call
            const formData = new FormData();
            formData.append("event_id", eventId);

            // Get previously assigned questions for this group
            const previouslyAssigned = questions
                .filter(q => {
                    const questionGroup = q.question_group || q.group_id;
                    return questionGroup && questionGroup.toString() === selectedGroupId.toString();
                })
                .map(q => q.id || q.question_id || q.form_question_id);

            // Find questions to add (newly selected)
            const questionsToAdd = selectedQuestions.filter(id => !previouslyAssigned.includes(id));

            // Find questions to remove (previously assigned but now unchecked)
            const questionsToRemove = previouslyAssigned.filter(id => !selectedQuestions.includes(id));

            console.log("Previously assigned:", previouslyAssigned);
            console.log("Currently selected:", selectedQuestions);
            console.log("Questions to add:", questionsToAdd);
            console.log("Questions to remove:", questionsToRemove);

            // Add all currently selected questions to FormData
            selectedQuestions.forEach((questionId, index) => {
                const question = questions.find(q =>
                    (q.id || q.question_id || q.form_question_id) === questionId
                );

                // Use 'general_form_id' field from the question object
                const generalFormId = question?.general_form_id || questionId;
                formData.append(`questions[${index}][general_form_id]`, generalFormId);
                formData.append(`questions[${index}][question_group]`, selectedGroupId.toString());
            });

            // Add questions to remove with question_group = 0 or empty to unassign them
            questionsToRemove.forEach((questionId, index) => {
                const question = questions.find(q =>
                    (q.id || q.question_id || q.form_question_id) === questionId
                );

                const generalFormId = question?.general_form_id || questionId;
                const removeIndex = selectedQuestions.length + index;
                formData.append(`questions[${removeIndex}][general_form_id]`, generalFormId);
                formData.append(`questions[${removeIndex}][question_group]`, "0"); // 0 means remove from group
            });

            console.log("Calling updateEventFormQuestion API with FormData");
            // Log FormData contents for debugging
            for (let pair of formData.entries()) {
                console.log(pair[0] + ': ' + pair[1]);
            }

            // Call the API
            const response = await authAPI.updateEventFormQuestion(formData);
            console.log("Update Event Form Question Response:", response);

            // Refresh questions list to get updated group assignments
            await fetchEventFormQuestions();

            // Update local state with selected questions
            setGroups(prevGroups => prevGroups.map(group => {
                if (group.id === selectedGroupId) {
                    const newQuestions = questions.filter(q =>
                        selectedQuestions.includes(q.id || q.question_id || q.form_question_id)
                    );
                    return {
                        ...group,
                        questions: newQuestions // Replace instead of append
                    };
                }
                return group;
            }));

            // Show success message
            const addedCount = questionsToAdd.length;
            const removedCount = questionsToRemove.length;
            let message = "";
            if (addedCount > 0 && removedCount > 0) {
                message = `Successfully added ${addedCount} and removed ${removedCount} question(s)!`;
            } else if (addedCount > 0) {
                message = `Successfully added ${addedCount} question(s) to the group!`;
            } else if (removedCount > 0) {
                message = `Successfully removed ${removedCount} question(s) from the group!`;
            } else {
                message = "No changes made.";
            }
            triggerToast(message);

            // Close modal and reset state
            setShowQuestionsModal(false);
            setSelectedQuestions([]);
            setSelectedGroupId(null);
        } catch (error) {
            console.error("Error updating questions in group:", error);
            triggerToast("Failed to update questions. Please try again.", 'error');
        } finally {
            setAddingQuestions(false);
        }
    };

    // Handle close questions modal
    const handleCloseQuestionsModal = () => {
        setShowQuestionsModal(false);
        setSelectedQuestions([]);
        setSelectedGroupId(null);
    };

    // Handle delete group
    const handleDeleteGroup = async (groupId, groupName) => {
        console.log("handleDeleteGroup called with:", { groupId, groupName });

        // Validate group ID
        if (!groupId || groupId === 0 || groupId === "0") {
            console.error("Invalid group ID:", groupId);
            triggerToast("Cannot delete group: Invalid group ID. Please refresh the page and try again.", 'error');
            return;
        }

        const confirmDelete = window.confirm(`Are you sure you want to delete "${groupName}"?`);
        if (!confirmDelete) return;

        try {
            console.log("Deleting group with ID:", groupId, "Type:", typeof groupId);
            const response = await authAPI.deleteGroupQuestion(groupId);
            console.log("Delete Group Response:", response);

            // Remove from local state
            setGroups(groups.filter(g => g.id !== groupId));

            // Optionally show success message
            // alert("Group deleted successfully!");
        } catch (error) {
            console.error("Error deleting group:", error);
            triggerToast("Failed to delete group. Please try again.", 'error');
        }
    };

    // Fetch groups when component mounts
    useEffect(() => {
        fetchGroupQuestions();

        const storedEventId = sessionStorage.getItem("event_id");
        if (storedEventId) {
            setEventId(storedEventId);
            console.log("Event ID from sessionStorage:", storedEventId);

            authAPI.getEventDetails(storedEventId).then((res) => {
                if (res && res.data && res.data.EventData && res.data.EventData[0]) {
                    const details = res.data.EventData[0];
                    console.log("Event Details:", details);

                    // Store event_id from API response if available
                    if (details.event_id || details.id) {
                        const apiEventId = details.event_id || details.id;
                        setEventId(apiEventId);
                        console.log("Event ID from API:", apiEventId);
                    }
                }
            }).catch((error) => {
                console.error("Error fetching event details:", error);
            });
        }
    }, []);

    // Pre-select questions that are already assigned to the selected group
    useEffect(() => {
        if (questions.length > 0 && selectedGroupId !== null && showQuestionsModal) {
            // Find questions that are already assigned to this group
            const alreadyAssignedQuestions = questions
                .filter(q => {
                    // Check if question_group matches the selected group ID
                    const questionGroup = q.question_group || q.group_id;
                    return questionGroup && questionGroup.toString() === selectedGroupId.toString();
                })
                .map(q => q.id || q.question_id || q.form_question_id);

            console.log("Pre-selecting questions for group:", selectedGroupId, alreadyAssignedQuestions);
            setSelectedQuestions(alreadyAssignedQuestions);
        }
    }, [questions, selectedGroupId, showQuestionsModal]);

    // Drag and drop handlers for group reordering
    const handleDragStart = (e, index) => {
        setDraggedGroupIndex(index);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e, index) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        setDraggedOverIndex(index);
    };

    const handleDragLeave = () => {
        setDraggedOverIndex(null);
    };

    const handleDrop = async (e, targetIndex) => {
        e.preventDefault();

        if (draggedGroupIndex === null || draggedGroupIndex === targetIndex) {
            setDraggedGroupIndex(null);
            setDraggedOverIndex(null);
            return;
        }

        // Reorder groups locally
        const reorderedGroups = [...groups];
        const [draggedGroup] = reorderedGroups.splice(draggedGroupIndex, 1);
        reorderedGroups.splice(targetIndex, 0, draggedGroup);

        // Update local state immediately for snappy UI
        setGroups(reorderedGroups);
        setDraggedGroupIndex(null);
        setDraggedOverIndex(null);

        // Call API for all affected groups to ensure the entire order is saved correctly
        try {
            console.log('Syncing entire group order with server...');

            // We update all groups to their new positions (1-based index)
            // This avoids conflicts if the server doesn't handle shifts automatically
            const updatePromises = reorderedGroups.map((group, idx) => {
                const newOrderIndex = idx + 1;
                console.log(`Updating group "${group.name}" (ID: ${group.id}) to order_index: ${newOrderIndex}`);
                return authAPI.editGroupQuestionOrder({
                    id: group.id,
                    order_index: newOrderIndex
                });
            });

            const results = await Promise.all(updatePromises);
            console.log('Bulk update results:', results);

            // Fetch refreshed groups to ensure we are in sync with the source of truth
            await fetchGroupQuestions();
        } catch (error) {
            console.error('Error syncing group order:', error);
            triggerToast('Failed to update group order on server. Reverting to previous state.', 'error');
            // Revert to server state on error
            await fetchGroupQuestions();
        }
    };

    const handleDragEnd = () => {
        setDraggedGroupIndex(null);
        setDraggedOverIndex(null);
    };

    return (
        <div className="event-form-section">
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 24,
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <h3 style={{ fontWeight: 700, fontSize: "1.6rem", margin: 0 }}>
                        Question Grouping
                    </h3>
                    <HelpIcon 
                        title={helpContent.grouping.title} 
                        content={helpContent.grouping.content} 
                    />
                </div>
                {!isReadOnly && (
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
                )}
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
                            {isEditMode ? "Edit Group" : "Add Group"}
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
                                disabled={loading}
                                style={{
                                    background: loading ? "#ccc" : "#da251c",
                                    border: "none",
                                    color: "#fff",
                                    borderRadius: 6,
                                    padding: "10px 24px",
                                    fontWeight: 600,
                                    fontSize: "1rem",
                                    cursor: loading ? "not-allowed" : "pointer",
                                }}
                            >
                                {loading ? (isEditMode ? "Updating..." : "Saving...") : (isEditMode ? "Update" : "Save")}
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
                {fetchingGroups ? (
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            minHeight: 236,
                            color: "#666",
                            fontSize: "1.1rem",
                        }}
                    >
                        <i className="fas fa-spinner fa-spin" style={{ marginRight: 12 }}></i>
                        Loading groups...
                    </div>
                ) : groups.length === 0 ? (
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
                            <p>“Organize your event form questions into groups, such as Personal Details, Address Information, Emergency Details and as per your choice”, to get started Click on Add Group to create the group and add questions as per the group you created</p>
                        </div>
                    </div>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                        {groups.map((group, index) => {
                            console.log("Rendering group:", { id: group.id, name: group.name });
                            const isDragging = draggedGroupIndex === index;
                            const isDraggedOver = draggedOverIndex === index;

                            return (
                                <div
                                    key={group.id}
                                    draggable={!isReadOnly}
                                    onDragStart={(e) => !isReadOnly && handleDragStart(e, index)}
                                    onDragOver={(e) => !isReadOnly && handleDragOver(e, index)}
                                    onDragLeave={!isReadOnly ? handleDragLeave : undefined}
                                    onDrop={(e) => !isReadOnly && handleDrop(e, index)}
                                    onDragEnd={!isReadOnly ? handleDragEnd : undefined}
                                    style={{
                                        border: isDraggedOver ? "2px dashed #da251c" : "1.5px solid transparent",
                                        borderRadius: 12,
                                        padding: "24px 20px",
                                        display: "flex",
                                        marginTop: "12px",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        background: "#fff",
                                        boxShadow: isDragging ? "0 8px 24px rgba(0, 0, 0, 0.3)" : "0 2px 8px rgba(0, 0, 0, 0.2)",
                                        transition: "all 0.2s ease",
                                        position: "relative",
                                        opacity: isDragging ? 0.5 : 1,
                                        cursor: isReadOnly ? "default" : "move",
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!isDragging && !isReadOnly) {
                                            e.currentTarget.style.border = "1.5px solid #da251c";
                                            e.currentTarget.style.boxShadow = "0 4px 16px rgba(0, 0, 0, 0.2)";
                                        }
                                        const icons = e.currentTarget.querySelector('.group-icons');
                                        if (icons && !isReadOnly) icons.style.opacity = "1";
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!isDragging && !isDraggedOver) {
                                            e.currentTarget.style.border = "1.5px solid transparent";
                                            e.currentTarget.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.2)";
                                        }
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
                                    {!isReadOnly && (
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
                                                onClick={() => handleEditGroup(group.id, group.name)}
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
                                                onClick={() => handleDeleteGroup(group.id, group.name)}
                                                title="Delete"
                                            >
                                                <i className="fas fa-trash"></i>
                                            </button>
                                        </div>
                                    )}

                                    {!isReadOnly && (
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
                                            onClick={() => handleAddQuestion(group.id)}
                                        >
                                            + Add Question
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Questions Modal */}
            {showQuestionsModal && (
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
                    onClick={handleCloseQuestionsModal}
                >
                    <div
                        style={{
                            background: "#fff",
                            borderRadius: 12,
                            padding: 32,
                            width: "90%",
                            maxWidth: 700,
                            maxHeight: "80vh",
                            overflow: "auto",
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
                            Add Questions to Group
                        </h3>

                        {loadingQuestions ? (
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    minHeight: 200,
                                    color: "#666",
                                    fontSize: "1.1rem",
                                }}
                            >
                                <i className="fas fa-spinner fa-spin" style={{ marginRight: 12 }}></i>
                                Loading questions...
                            </div>
                        ) : questions.length === 0 ? (
                            <div
                                style={{
                                    textAlign: "center",
                                    padding: "40px 20px",
                                    color: "#666",
                                }}
                            >
                                <i className="fas fa-question-circle" style={{ fontSize: "3rem", color: "#da251c", marginBottom: 16 }}></i>
                                <p>No questions found for this event.</p>
                            </div>
                        ) : (
                            <div style={{ marginBottom: 24 }}>
                                {questions.map((question) => {
                                    const questionId = question.id || question.question_id || question.form_question_id;
                                    const questionText = question.question_label || question.question || question.question_text || question.title || "Untitled Question";
                                    const questionType = question.question_form_type || question.question_type || "";
                                    const formName = question.form_name || question.new_form_name || "";
                                    const isChecked = selectedQuestions.includes(questionId);

                                    // Check if question is assigned to a different group
                                    const questionGroup = question.question_group || question.group_id;
                                    const isInDifferentGroup = questionGroup &&
                                        questionGroup.toString() !== selectedGroupId.toString() &&
                                        questionGroup.toString() !== "0";

                                    // Find the group name if in different group
                                    let assignedGroupName = "";
                                    if (isInDifferentGroup) {
                                        const assignedGroup = groups.find(g => g.id.toString() === questionGroup.toString());
                                        assignedGroupName = assignedGroup?.name || "Another Group";
                                    }

                                    return (
                                        <div
                                            key={questionId}
                                            style={{
                                                border: `1.5px solid ${isInDifferentGroup ? "#ffa500" : "#ddd"}`,
                                                borderRadius: 8,
                                                padding: "16px",
                                                marginBottom: 12,
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 12,
                                                cursor: "pointer",
                                                background: isInDifferentGroup ? "#fff9e6" : (isChecked ? "#fff5f5" : "#fff"),
                                                transition: "all 0.2s ease",
                                            }}
                                            onClick={() => handleQuestionToggle(questionId)}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.borderColor = isInDifferentGroup ? "#ff8c00" : "#da251c";
                                                e.currentTarget.style.boxShadow = "0 2px 8px rgba(218, 37, 28, 0.1)";
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.borderColor = isInDifferentGroup ? "#ffa500" : "#ddd";
                                                e.currentTarget.style.boxShadow = "none";
                                            }}
                                        >
                                            <div
                                                style={{
                                                    width: 20,
                                                    height: 20,
                                                    border: `2px solid ${isChecked ? "#da251c" : "#ddd"}`,
                                                    borderRadius: 4,
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    background: isChecked ? "#da251c" : "#fff",
                                                    flexShrink: 0,
                                                }}
                                            >
                                                {isChecked && (
                                                    <i className="fas fa-check" style={{ color: "#fff", fontSize: "0.75rem" }}></i>
                                                )}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontWeight: 600, color: "#333", marginBottom: 4 }}>
                                                    {questionText}
                                                </div>
                                                <div style={{ fontSize: "0.85rem", color: "#666", display: "flex", gap: 12, flexWrap: "wrap" }}>
                                                    {questionType && (
                                                        <span>Type: <strong>{questionType}</strong></span>
                                                    )}
                                                    {formName && (
                                                        <span>• Form: <strong>{formName}</strong></span>
                                                    )}
                                                </div>
                                                {/* Show warning if question is in different group */}
                                                {isInDifferentGroup && (
                                                    <div style={{
                                                        marginTop: 8,
                                                        padding: "6px 10px",
                                                        background: "#fff3cd",
                                                        border: "1px solid #ffc107",
                                                        borderRadius: 4,
                                                        fontSize: "0.8rem",
                                                        color: "#856404",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: 6
                                                    }}>
                                                        <i className="fas fa-exclamation-triangle"></i>
                                                        <span>Already added to <strong>{assignedGroupName}</strong></span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        <div
                            style={{
                                display: "flex",
                                justifyContent: "flex-end",
                                gap: 12,
                                marginTop: 24,
                            }}
                        >
                            <button
                                onClick={handleCloseQuestionsModal}
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
                                onClick={handleAddQuestionsToGroup}
                                disabled={selectedQuestions.length === 0 || addingQuestions}
                                style={{
                                    background: (selectedQuestions.length === 0 || addingQuestions) ? "#ccc" : "#da251c",
                                    border: "none",
                                    color: "#fff",
                                    borderRadius: 6,
                                    padding: "10px 24px",
                                    fontWeight: 600,
                                    fontSize: "1rem",
                                    cursor: (selectedQuestions.length === 0 || addingQuestions) ? "not-allowed" : "pointer",
                                }}
                            >
                                {addingQuestions ? "Adding..." : `Add ${selectedQuestions.length > 0 ? `(${selectedQuestions.length})` : ""}`}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Navigation Buttons */}
            {!isReadOnly && (
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
            )}

            {/* Custom Confirmation Modal */}
            {showConfirmModal && (
                <div
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: "rgba(0, 0, 0, 0.6)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 2000,
                    }}
                    onClick={handleConfirmCancel}
                >
                    <div
                        style={{
                            background: "#fff",
                            borderRadius: 12,
                            padding: 32,
                            width: "90%",
                            maxWidth: 500,
                            boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div style={{ textAlign: "center", marginBottom: 24 }}>
                            <div style={{
                                width: 60,
                                height: 60,
                                borderRadius: "50%",
                                background: "#fff3cd",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                margin: "0 auto 16px",
                            }}>
                                <i className="fas fa-exclamation-triangle" style={{ fontSize: "2rem", color: "#ffc107" }}></i>
                            </div>
                            <h3
                                style={{
                                    fontWeight: 700,
                                    fontSize: "1.4rem",
                                    marginBottom: 16,
                                    color: "#333",
                                }}
                            >
                                Move Question to Different Group?
                            </h3>
                            <p style={{ fontSize: "1rem", color: "#666", lineHeight: 1.6, margin: 0 }}>
                                This question is already added to <strong style={{ color: "#da251c" }}>"{confirmModalData.fromGroup}"</strong>.
                            </p>
                            <p style={{ fontSize: "1rem", color: "#666", lineHeight: 1.6, marginTop: 12 }}>
                                If you add it to <strong style={{ color: "#da251c" }}>"{confirmModalData.toGroup}"</strong>, it will be removed from <strong>"{confirmModalData.fromGroup}"</strong>.
                            </p>
                            <p style={{ fontSize: "1rem", color: "#333", fontWeight: 600, marginTop: 16 }}>
                                Do you want to continue?
                            </p>
                        </div>

                        <div
                            style={{
                                display: "flex",
                                justifyContent: "center",
                                gap: 12,
                            }}
                        >
                            <button
                                onClick={handleConfirmCancel}
                                style={{
                                    background: "#fff",
                                    border: "1.5px solid #da251c",
                                    color: "#da251c",
                                    borderRadius: 6,
                                    padding: "10px 32px",
                                    fontWeight: 600,
                                    fontSize: "1rem",
                                    cursor: "pointer",
                                    minWidth: 120,
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmOk}
                                style={{
                                    background: "#da251c",
                                    border: "none",
                                    color: "#fff",
                                    borderRadius: 6,
                                    padding: "10px 32px",
                                    fontWeight: 600,
                                    fontSize: "1rem",
                                    cursor: "pointer",
                                    minWidth: 120,
                                }}
                            >
                                OK
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Grouping;
