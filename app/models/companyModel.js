class Company {
    constructor({
        name,
        about,
        owner_id,
        price_range,
        website_url,
        lat,
        long,
        preferences = []
    }) {
        this.name = name;
        this.about = about;
        this.owner_id = owner_id;
        this.price_range = price_range;
        this.website_url = website_url;
        this.lat = lat;
        this.long = long;
        this.preferences = preferences;
    }

    toJSON() {
        return {
            name: this.name,
            about: this.about,
            owner_id: this.owner_id,
            price_range: this.price_range,
            website_url: this.website_url,
            lat: this.lat,
            long: this.long,
            preferences: this.preferences
        };
    }
}

export default Company;
