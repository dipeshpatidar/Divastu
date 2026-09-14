package com.indore.divyavastu.spaces.dto;

import java.util.List;

public class ParsedPropertyDTO {
    private String bhk;
    private String type;
    private String city;
    private String sector;
    private String colony;
    private String rentVal;
    private Double rentAmount;
    private String brokerageVal;
    private String areaSqFt;
    private String depositVal;
    private String ownerName;
    private String ownerPhone;
    private String vastuFacing;
    private List<String> amenities;
    private String title;
    private String label;
    private boolean savedToDatabase;

    public ParsedPropertyDTO() {
    }

    public ParsedPropertyDTO(String bhk, String type, String city, String sector, String colony, String rentVal, Double rentAmount, String vastuFacing, List<String> amenities, String title, String label, boolean savedToDatabase) {
        this.bhk = bhk;
        this.type = type;
        this.city = city;
        this.sector = sector;
        this.colony = colony;
        this.rentVal = rentVal;
        this.rentAmount = rentAmount;
        this.vastuFacing = vastuFacing;
        this.amenities = amenities;
        this.title = title;
        this.label = label;
        this.savedToDatabase = savedToDatabase;
    }

    public ParsedPropertyDTO(String bhk, String type, String city, String sector, String colony, String rentVal, Double rentAmount, String brokerageVal, String areaSqFt, String depositVal, String ownerName, String ownerPhone, String vastuFacing, List<String> amenities, String title, String label, boolean savedToDatabase) {
        this.bhk = bhk;
        this.type = type;
        this.city = city;
        this.sector = sector;
        this.colony = colony;
        this.rentVal = rentVal;
        this.rentAmount = rentAmount;
        this.brokerageVal = brokerageVal;
        this.areaSqFt = areaSqFt;
        this.depositVal = depositVal;
        this.ownerName = ownerName;
        this.ownerPhone = ownerPhone;
        this.vastuFacing = vastuFacing;
        this.amenities = amenities;
        this.title = title;
        this.label = label;
        this.savedToDatabase = savedToDatabase;
    }

    public String getBhk() {
        return bhk;
    }

    public void setBhk(String bhk) {
        this.bhk = bhk;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getSector() {
        return sector;
    }

    public void setSector(String sector) {
        this.sector = sector;
    }

    public String getColony() {
        return colony;
    }

    public void setColony(String colony) {
        this.colony = colony;
    }

    public String getRentVal() {
        return rentVal;
    }

    public void setRentVal(String rentVal) {
        this.rentVal = rentVal;
    }

    public Double getRentAmount() {
        return rentAmount;
    }

    public void setRentAmount(Double rentAmount) {
        this.rentAmount = rentAmount;
    }

    public String getVastuFacing() {
        return vastuFacing;
    }

    public void setVastuFacing(String vastuFacing) {
        this.vastuFacing = vastuFacing;
    }

    public List<String> getAmenities() {
        return amenities;
    }

    public void setAmenities(List<String> amenities) {
        this.amenities = amenities;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getLabel() {
        return label;
    }

    public void setLabel(String label) {
        this.label = label;
    }

    public String getBrokerageVal() {
        return brokerageVal;
    }

    public void setBrokerageVal(String brokerageVal) {
        this.brokerageVal = brokerageVal;
    }

    public String getAreaSqFt() {
        return areaSqFt;
    }

    public void setAreaSqFt(String areaSqFt) {
        this.areaSqFt = areaSqFt;
    }

    public String getDepositVal() {
        return depositVal;
    }

    public void setDepositVal(String depositVal) {
        this.depositVal = depositVal;
    }

    public String getOwnerName() {
        return ownerName;
    }

    public void setOwnerName(String ownerName) {
        this.ownerName = ownerName;
    }

    public String getOwnerPhone() {
        return ownerPhone;
    }

    public void setOwnerPhone(String ownerPhone) {
        this.ownerPhone = ownerPhone;
    }

    public boolean isSavedToDatabase() {
        return savedToDatabase;
    }

    public void setSavedToDatabase(boolean savedToDatabase) {
        this.savedToDatabase = savedToDatabase;
    }
}

