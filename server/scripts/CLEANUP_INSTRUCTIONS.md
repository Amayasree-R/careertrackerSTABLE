# Phase 7: Database Migration Cleanup Instructions

**⚠️ WARNING: DO NOT EXECUTE THESE STEPS UNTIL THE DUAL READ/WRITE SYSTEM HAS BEEN RUNNING STABLY IN PRODUCTION FOR AT LEAST 2-4 WEEKS.**

Once the migration is fully stable, and all new data is being correctly read from and written to the new collections (`profiles`, `education`, `experience`, `skills`, etc.), you can perform the final cleanup to remove the legacy fields from the `users` collection.

## 1. Stop Dual Writes
First, update the service layer (e.g., `server/services/dualWriteProfileService.js`) and any other refactored controllers to **stop writing** to the legacy `user.profile`, `user.education`, `user.experience`, etc. fields. Write operations should exclusively target the new Mongoose collections.

## 2. Stop Dual Reads (Fallback)
Update the read operations to no longer fallback to the `User` collection for these fields. If a user record does not exist in the new collection, it should be considered empty or trigger a creation flow.

## 3. Deprecate and Remove Fields from `User.js` Model
Remove the following embedded fields and arrays from `server/models/User.js`:
- `personalDetails`
- `currentStatus`
- `education`
- `experience`
- `socialLinks`
- `profile`
- `careerInfo`
- `resumeFile`
- `resumeData`
- `skillAnalysis`
- `certifications`
- `projects`
- `resumeVersions`

The `User` model should ONLY contain authentication and core account fields: `username`, `email`, `fullName`, `phoneNumber`, `password`, `createdAt`.

## 4. Run MongoDB Cleanup Script
Finally, execute a MongoDB query to physically remove these fields from existing documents in the database, reclaiming storage space.

🚨 **Backup the database before running this!**

```js
// MongoDB Shell Command or Mongoose Script
db.users.updateMany(
  {},
  {
    $unset: {
      "personalDetails": "",
      "currentStatus": "",
      "education": "",
      "experience": "",
      "socialLinks": "",
      "profile": "",
      "careerInfo": "",
      "resumeFile": "",
      "resumeData": "",
      "skillAnalysis": "",
      "certifications": "",
      "projects": "",
      "resumeVersions": "",
      "migrationCompleted": ""
    }
  }
);
```

After these steps, the migration is 100% complete and the monolith will be successfully modularized.
