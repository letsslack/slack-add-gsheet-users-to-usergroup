# slack-add-gsheet-users-to-usergroup

This lightweight proof of concept reads a list of user email addresses from a Google Sheet, looks up corresponding Slack UserIds, and adds those users to a user group in Slack.

## Getting Started

1. Create a new Google Spreadsheet and rename Sheet1 to "Emails" and Sheet2 to "UserIDs".
2. Enable Google Apps Script: Extensions > Apps Script.
3. Replace the contents of `Code.gs` with the `code.gs` file in this repository.
4. Update the main function in `code.gs` (line 180) with the UserGroupID of the User Group you would like to add the users to.
5. Create a Slack user token with OAuth permissions for the following scopes:
   - admin.usergroups:write
   - users:read
   - users:read.email
   - usergroups:write
6. Create a `user_token` script property in Google Apps Script with the user token you obtained in the previous step. (Click the gear icon > Settings > Script properties)
7. Save `Code.gs` and run the main function. This will read emails from the "Emails" sheet and populate "UserIDs" with the corresponding UserIds, and then add the users to the specified UserGroup in Slack.
