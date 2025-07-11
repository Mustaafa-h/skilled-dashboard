class Worker {
    constructor({
        id,
        _id,
        company_id,
        full_name,
        nationality,
        phone,
        gender,
        image_url = null,
        is_active = true,
        created_at,
        workerSkills = []
    }) {
        this._id = _id || id;
        this.company_id = company_id;
        this.full_name = full_name;
        this.nationality = nationality;
        this.phone = phone;
        this.gender = gender;
        this.image_url = image_url;
        this.is_active = is_active;
        this.created_at = created_at;
        this.workerSkills = workerSkills; // Array of { skill_name, years_of_experience, certification }
    }

    toJSON() {
        return {
            full_name: this.full_name,
            nationality: this.nationality,
            phone: this.phone,
            gender: this.gender,
            workerSkills: this.workerSkills, // expected structure
            is_active: this.is_active
        };
    }

    getSkillString() {
        if (Array.isArray(this.workerSkills) && this.workerSkills.length > 0) {
            return this.workerSkills.map(skill => skill.skill_name).join(', ');
        }
        return '';
    }

    getCertificationString() {
        if (Array.isArray(this.workerSkills)) {
            const certifications = this.workerSkills
                .map(skill => skill.certification)
                .filter(cert => cert); // skip null or undefined
            return certifications.length > 0 ? certifications.join(', ') : '';
        }
        return '';
    }

    getExperienceString() {
        if (Array.isArray(this.workerSkills)) {
            const experiences = this.workerSkills
                .map(skill => `${skill.skill_name}: ${skill.years_of_experience || 0} yrs`);
            return experiences.length > 0 ? experiences.join(', ') : '';
        }
        return '';
    }

    isActiveString() {
        return this.is_active ? "Active" : "Inactive";
    }
}

export default Worker;
