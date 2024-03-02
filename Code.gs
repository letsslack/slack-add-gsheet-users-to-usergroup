const user_token = PropertiesService.getScriptProperties().getProperty('user_token'); // Define user_token globally

function apiSlackCallGet(endpoint, payload) {
  try {
    let queryString = '';
    for (const key in payload) {
      if (payload.hasOwnProperty(key)) {
        queryString += '&' + encodeURIComponent(key) + '=' + encodeURIComponent(payload[key]);
      }
    }
    const url = "https://slack.com/api/" + endpoint + "?" + queryString.substring(1); // Remove leading '&'

    console.log('API URL:', url); // Log the constructed URL

    const options = {
      "method": "get",
      "headers": {
        "Authorization": "Bearer " + user_token
      }
    };

    const response = UrlFetchApp.fetch(url, options); // Perform GET request
    const responseData = JSON.parse(response.getContentText());
    if (!responseData.ok) {
      Logger.log(responseData);
      throw new Error("Error in API call: " + responseData.error);
    }
    return responseData;
  } catch (error) {
    Logger.log("Error in apiSlackCallGet: " + error);
    throw error;
  }
}

function apiSlackCallPost(endpoint, payload) {
  try {
    const url = "https://slack.com/api/" + endpoint;
    const options = {
      "method": "post",
      "headers": {
        "Authorization": "Bearer " + user_token,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      "payload": payload
    };

    console.log('API URL:', url); // Log the constructed URL

    const response = UrlFetchApp.fetch(url, options); // Perform POST request

    const responseData = JSON.parse(response.getContentText());
  

    if (!responseData.ok) {
      Logger.log(responseData);
      throw new Error("Error in API call: " + responseData.error);
    }
    return responseData;
  } catch (error) {
    Logger.log("Error in apiSlackCallPost: " + error);
    throw error;
  }
}


function fetchUserIDsByEmail(emails_array) {
  const userIDs = [];
  for (const email of emails_array) {
    try {
      const payload = {
        "email": email,
      };
      const data = apiSlackCallGet("users.lookupByEmail", payload); // Specify the method as "get"
      userIDs.push(data.user.id);
    } catch (error) {
      Logger.log("Error in fetchUserIDsByEmail: " + error);
      throw error;
    }
  }
  return userIDs;
}

function updateUserGroup(usergroupID, usersString) {
  try {
    
    const payload = {
      "usergroup": usergroupID,
      "users": usersString
    };

    const response = apiSlackCallPost("usergroups.users.update", payload);
    console.log('Response:', response); // Log the response

    if (!response.ok) {
      Logger.log(response);
      throw new Error("Error updating user group");
    }
    return response;
  } catch (error) {
    Logger.log("Error in updateUserGroup: " + error);
    throw error;
  }
}


function readEmailsFromSheet() {
  try {
    const sheetName = "Emails";
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
    if (!sheet) {
      throw new Error("Sheet '" + sheetName + "' not found");
    }

    const lastRow = sheet.getLastRow();
    const emailColumn = 1;

    const emailArray = [];
    for (let i = 1; i <= lastRow; i++) {
      const email = sheet.getRange(i, emailColumn).getValue();
      if (email) {
        emailArray.push(email);
      }
    }

    return emailArray;
  } catch (error) {
    Logger.log("Error in readEmailsFromSheet: " + error);
    throw error;
  }
}

function writeUserIDsToSheet(userIDs) {
  try {
    const sheetName = "UserIDs";
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = spreadsheet.getSheetByName(sheetName);
    
    // Create the sheet if it doesn't exist
    if (!sheet) {
      sheet = spreadsheet.insertSheet(sheetName);

    }

    // Clear old data
    sheet.clear();

    // Write user IDs to the sheet
    const numRows = userIDs.length;
    for (let i = 0; i < numRows; i++) {
      sheet.getRange(i + 1, 1).setValue(userIDs[i]);
    }
    
    Logger.log("User IDs written to sheet successfully.");
  } catch (error) {
    Logger.log("Error in writeUserIDsToSheet: " + error);
    throw error;
  }
}

function main() {
  try {
    // Read email addresses from the "Emails" sheet
    const emailSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Emails");
    if (!emailSheet) {
      throw new Error("Emails sheet not found");
    }
    const emails = readEmailsFromSheet(emailSheet);

    if (!emails || emails.length === 0) {
      throw new Error("No emails found in the sheet");
    }

    // Fetch corresponding Slack User IDs
    const userIDs = fetchUserIDsByEmail(emails);

    // Write Slack User IDs to the "UserIDs" sheet
    writeUserIDsToSheet(userIDs);

    // Update the usergroup with the list of userIDs
    const usergroupID = "<usergroupID>"; // Replace with your usergroup ID. Example: const usergroupID = "S06MWRP959P";
    const usersString = userIDs.join(",");

    // Call updateUserGroup with the usergroup ID and users string
    updateUserGroup(usergroupID, usersString);

    Logger.log("Process completed successfully.");
  } catch (error) {
    Logger.log("Error in main function: " + error);
  }
}

