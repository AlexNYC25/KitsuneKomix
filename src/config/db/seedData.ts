import { getDatabase } from "./sqliteConnection.ts";


const SETTINGS_DATA = [
    { key: "app_name", value: "KitsuneKomix", admin_only: 1 },
    { key: "max_upload_size", value: "10MB", admin_only: 1 },
    { key: "enable_logging", value: "true", admin_only: 0 },
];

export function seedData() {
    const db = getDatabase();

    SETTINGS_DATA.forEach((setting) => {
        const { key, value, admin_only } = setting;
        db.exec(
            `INSERT INTO app_settings (key, value, admin_only) VALUES (?, ?, ?)`,
            [key, value, admin_only],
        );
    });

    console.log("Seeding initial data... (currently no seed data to insert)");
}