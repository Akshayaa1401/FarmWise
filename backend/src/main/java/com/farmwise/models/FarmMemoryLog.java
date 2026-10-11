package com.farmwise.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.Map;

@Document(collection = "farm_memory_logs")
public class FarmMemoryLog {

    @Id
    private String id;

    @Indexed
    private String farmerId;

    private String actionType; // PROFILE_CREATED, PROFILE_UPDATED, SEED_COMPARISON_PERFORMED
    private String title;
    private String summary;
    private Map<String, Object> snapshotData;
    private Instant timestamp = Instant.now();

    public FarmMemoryLog() {}

    public FarmMemoryLog(String farmerId, String actionType, String title, String summary, Map<String, Object> snapshotData) {
        this.farmerId = farmerId;
        this.actionType = actionType;
        this.title = title;
        this.summary = summary;
        this.snapshotData = snapshotData;
        this.timestamp = Instant.now();
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getFarmerId() {
        return farmerId;
    }

    public void setFarmerId(String farmerId) {
        this.farmerId = farmerId;
    }

    public String getActionType() {
        return actionType;
    }

    public void setActionType(String actionType) {
        this.actionType = actionType;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getSummary() {
        return summary;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }

    public Map<String, Object> getSnapshotData() {
        return snapshotData;
    }

    public void setSnapshotData(Map<String, Object> snapshotData) {
        this.snapshotData = snapshotData;
    }

    public Instant getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Instant timestamp) {
        this.timestamp = timestamp;
    }
}
