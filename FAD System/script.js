// ==========================================
// FAKE SOCIAL MEDIA ACCOUNT DETECTION SYSTEM
// COMPLETE MAIN SCRIPT - UPDATED VERSION
// ==========================================

// ==========================================
// VERCEL BACKEND CONFIGURATION
// ==========================================

// Backend deploy hone ke baad yahan apna Vercel Backend URL paste karna hai.
// Example:
const API_BASE_URL = "https://backend-jt5daoogk-fad-system.vercel.app";


// ==========================================
// HOME PAGE - START DETECTION BUTTON
// ==========================================

const startBtn = document.getElementById("startBtn");

if (startBtn) {

    startBtn.addEventListener("click", function () {

        window.location.href = "detect.html";

    });

}


// ==========================================
// HOME PAGE - DASHBOARD STATISTICS
// MYSQL VERSION
// ==========================================

const dashboardStats = document.getElementById("dashboardStats");

if (dashboardStats) {

    fetch(`${API_BASE_URL}/dashboard-stats`, {
    method: "GET",
    cache: "no-store"
})

        .then(response => {

            if (!response.ok) {
                throw new Error("Dashboard Stats API Error: " + response.status);
            }

            return response.json();

        })

        .then(data => {

            const totalAccounts =
                document.getElementById("totalAccounts");

            const fakeAccounts =
                document.getElementById("fakeAccounts");

            const genuineAccounts =
                document.getElementById("genuineAccounts");

            const highRisk =
                document.getElementById("highRisk");

            const mediumRisk =
                document.getElementById("mediumRisk");

            const lowRisk =
                document.getElementById("lowRisk");


            if (totalAccounts) {
                totalAccounts.textContent =
                    data.totalAccounts ?? 0;
            }

            if (fakeAccounts) {
                fakeAccounts.textContent =
                    data.fakeAccounts ?? 0;
            }

            if (genuineAccounts) {
                genuineAccounts.textContent =
                    data.genuineAccounts ?? 0;
            }

            if (highRisk) {
                highRisk.textContent =
                    data.highRisk ?? 0;
            }

            if (mediumRisk) {
                mediumRisk.textContent =
                    data.mediumRisk ?? 0;
            }

            if (lowRisk) {
                lowRisk.textContent =
                    data.lowRisk ?? 0;
            }

        })

        .catch(error => {

            console.error(
                "Dashboard Statistics Error:",
                error
            );

        });

}


// ==========================================
// DETECTION FORM
// ==========================================

const detectionForm =
    document.getElementById("detectionForm");

if (detectionForm) {

    detectionForm.addEventListener("submit", async function (event) {

        event.preventDefault();


        // ==========================================
        // GET FORM VALUES
        // ==========================================

        const username =
            document.getElementById("username")?.value.trim();

        const followers =
            Number(
                document.getElementById("followers")?.value || 0
            );

        const following =
            Number(
                document.getElementById("following")?.value || 0
            );

        const posts =
            Number(
                document.getElementById("posts")?.value || 0
            );

        const accountAge =
            Number(
                document.getElementById("accountAge")?.value || 0
            );

        const averageLikes =
            Number(
                document.getElementById("averageLikes")?.value || 0
            );

        const averageComments =
            Number(
                document.getElementById("averageComments")?.value || 0
            );


        // ==========================================
        // PROFILE PICTURE
        // ==========================================

        const profilePictureElement =
            document.querySelector(
                'input[name="profilePicture"]:checked'
            );

        const profilePicture =
            profilePictureElement
                ? profilePictureElement.value
                : "no";


        // ==========================================
        // BIO
        // ==========================================

        const bioElement =
            document.querySelector(
                'input[name="bio"]:checked'
            );

        const bio =
            bioElement
                ? bioElement.value
                : "no";


        // ==========================================
        // VERIFIED
        // ==========================================

        const verifiedElement =
            document.querySelector(
                'input[name="verified"]:checked'
            );

        const verified =
            verifiedElement
                ? verifiedElement.value
                : "no";


        // ==========================================
        // AUTOMATIC ENGAGEMENT CALCULATION
        // ==========================================

        let engagement = 0;

        if (followers > 0) {

            engagement =
                (
                    (
                        averageLikes +
                        averageComments
                    ) /
                    followers
                ) * 100;

        }

        engagement =
            Number(engagement.toFixed(2));


        // ==========================================
        // BASIC VALIDATION
        // ==========================================

        if (!username) {

            alert("Please enter username.");

            return;

        }

// ==========================================
// SAVE BASIC ACCOUNT DATA IMMEDIATELY
// This ensures result.html always receives the
// account information even before AI response.
// ==========================================

const basicAccountData = {
    username: username,
    followers: followers,
    following: following,
    posts: posts,
    accountAge: accountAge,
    averageLikes: averageLikes,
    averageComments: averageComments,
    engagement: engagement,
    profilePicture: profilePicture,
    bio: bio,
    verified: verified,

    prediction: "Analyzing...",
    score: 0,
    fakeProbability: 0,
    genuineProbability: 0,
    risk: "ANALYZING",
    reasons: [],
    databaseSaved: false
};

localStorage.setItem(
    "selectedAccount",
    JSON.stringify(basicAccountData)
);
        // ==========================================
        // LOADING MESSAGE
        // ==========================================

        const submitButton =
            detectionForm.querySelector(
                'button[type="submit"]'
            );

        if (submitButton) {

            submitButton.disabled = true;

            submitButton.textContent =
                "Analyzing...";

        }


        try {

            // ==========================================
            // SEND DATA TO FLASK / VERCEL BACKEND
            // ==========================================

            const response =
                await fetch(
                    `${API_BASE_URL}/predict`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({

                            username:
                                username,

                            followers:
                                followers,

                            following:
                                following,

                            posts:
                                posts,

                            accountAge:
                                accountAge,

                            averageLikes:
                                averageLikes,

                            averageComments:
                                averageComments,

                            engagement:
                                engagement,

                            profilePicture:
                                profilePicture,

                            bio:
                                bio,

                            verified:
                                verified

                        })
                    }
                );


            // ==========================================
            // CHECK RESPONSE
            // ==========================================

            if (!response.ok) {

                const errorText =
                    await response.text();

                throw new Error(
                    "Prediction API Error: " +
                    response.status +
                    " - " +
                    errorText
                );

            }


            const result =
                await response.json();


            // ==========================================
            // SAVE RESULT FOR RESULT PAGE
            // ==========================================

            const account = {

                username:
                    username,

                followers:
                    followers,

                following:
                    following,

                posts:
                    posts,

                accountAge:
                    accountAge,

                averageLikes:
                    averageLikes,

                averageComments:
                    averageComments,

                engagement:
                    engagement,

                profilePicture:
                    profilePicture,

                bio:
                    bio,

                verified:
                    verified,

                prediction:
                    result.prediction,

                score:
                    Number(
                        result.confidence ??
                        result.fakeProbability ??
                        0
                    ),

                fakeProbability:
                    Number(
                        result.fakeProbability ??
                        result.confidence ??
                        0
                    ),

                genuineProbability:
                    Number(
                        result.genuineProbability ??
                        (
                            100 -
                            Number(
                                result.fakeProbability ??
                                result.confidence ??
                                0
                            )
                        )
                    ),

                risk:
                    result.risk,

                reasons:
                    result.reasons || [],

                databaseSaved:
                    result.databaseSaved ?? false

            };


            // ==========================================
            // RISK CLASSIFICATION
            // ==========================================

            const fakeScore =
                Number(account.fakeProbability);


            if (fakeScore >= 70) {

                account.risk =
                    "HIGH RISK";

            }

            else if (fakeScore >= 40) {

                account.risk =
                    "MEDIUM RISK";

            }

            else {

                account.risk =
                    "LOW RISK";

            }


            // ==========================================
            // SAVE SELECTED ACCOUNT
            // ==========================================

            localStorage.setItem(
                "selectedAccount",
                JSON.stringify(account)
            );


            // ==========================================
            // SAVE DETECTION HISTORY
            // ==========================================

            let detectionHistory =
                JSON.parse(
                    localStorage.getItem(
                        "detectionHistory"
                    )
                ) || [];


            detectionHistory.unshift({

                username:
                    account.username,

                followers:
                    account.followers,

                following:
                    account.following,

                posts:
                    account.posts,

                accountAge:
                    account.accountAge,

                averageLikes:
                    account.averageLikes,

                averageComments:
                    account.averageComments,

                engagement:
                    account.engagement,

                profilePicture:
                    account.profilePicture,

                bio:
                    account.bio,

                verified:
                    account.verified,

                prediction:
                    account.prediction,

                score:
                    account.score,

                fakeProbability:
                    account.fakeProbability,

                genuineProbability:
                    account.genuineProbability,

                risk:
                    account.risk,

                reasons:
                    account.reasons,

                date:
                    new Date().toLocaleString()

            });


            localStorage.setItem(
                "detectionHistory",
                JSON.stringify(detectionHistory)
            );


            // ==========================================
            // GO TO RESULT PAGE
            // ==========================================

            window.location.href =
                "result.html";


        }

        catch (error) {

            console.error(
                "AI Detection Error:",
                error
            );

            alert(
                "Unable to connect with AI Detection server.\n\n" +
                error.message
            );

        }

        finally {

            if (submitButton) {

                submitButton.disabled = false;

                submitButton.textContent =
                    "Detect Account";

            }

        }

    });

}


// ==========================================
// RESULT PAGE
// ==========================================

const resultContainer =
    document.getElementById(
        "resultContainer"
    );

if (resultContainer) {

    const storedAccount =
        localStorage.getItem(
            "selectedAccount"
        );


    if (storedAccount) {

        const account =
            JSON.parse(storedAccount);


        // ==========================================
        // RESULT ELEMENTS
        // ==========================================

        const resultUsername =
            document.getElementById(
                "resultUsername"
            );

        const resultFollowers =
            document.getElementById(
                "resultFollowers"
            );

        const resultFollowing =
            document.getElementById(
                "resultFollowing"
            );

        const resultPosts =
            document.getElementById(
                "resultPosts"
            );

        const resultAge =
            document.getElementById(
                "resultAge"
            );

        const resultLikes =
            document.getElementById(
                "resultLikes"
            );

        const resultComments =
            document.getElementById(
                "resultComments"
            );

        const resultEngagement =
            document.getElementById(
                "resultEngagement"
            );


        if (resultUsername) {

            resultUsername.textContent =
                account.username;

        }

        if (resultFollowers) {

            resultFollowers.textContent =
                account.followers;

        }

        if (resultFollowing) {

            resultFollowing.textContent =
                account.following;

        }

        if (resultPosts) {

            resultPosts.textContent =
                account.posts;

        }

        if (resultAge) {

            resultAge.textContent =
                account.accountAge;

        }

        if (resultLikes) {

            resultLikes.textContent =
                account.averageLikes;

        }

        if (resultComments) {

            resultComments.textContent =
                account.averageComments;

        }

        if (resultEngagement) {

            resultEngagement.textContent =
                account.engagement + "%";

        }


        // ==========================================
        // FAKE / GENUINE PROBABILITY
        // ==========================================

        const fakeProbability =
            Number(
                account.fakeProbability ??
                account.score ??
                0
            );

        const genuineProbability =
            Number(
                account.genuineProbability ??
                (
                    100 -
                    fakeProbability
                )
            );


        const fakeProbabilityElement =
            document.getElementById(
                "fakeProbability"
            );

        const genuineProbabilityElement =
            document.getElementById(
                "genuineProbability"
            );


        if (fakeProbabilityElement) {

            fakeProbabilityElement.textContent =
                fakeProbability.toFixed(2) + "%";

        }

        if (genuineProbabilityElement) {

            genuineProbabilityElement.textContent =
                genuineProbability.toFixed(2) + "%";

        }


        // ==========================================
        // RISK CLASSIFICATION
        // ==========================================

        let riskLevel = "";

        if (fakeProbability >= 70) {

            riskLevel =
                "HIGH RISK";

        }

        else if (fakeProbability >= 40) {

            riskLevel =
                "MEDIUM RISK";

        }

        else {

            riskLevel =
                "LOW RISK";

        }


        const riskElement =
            document.getElementById(
                "riskLevel"
            );


        if (riskElement) {

            riskElement.textContent =
                riskLevel;

        }


        // ==========================================
        // PREDICTION
        // ==========================================

        const predictionElement =
            document.getElementById(
                "prediction"
            );


        if (predictionElement) {

            predictionElement.textContent =
                account.prediction ||
                (
                    fakeProbability >= 50
                        ? "FAKE ACCOUNT"
                        : "GENUINE ACCOUNT"
                );

        }


        // ==========================================
        // ACCOUNT HEALTH
        // ==========================================

        const accountHealthElement =
            document.getElementById(
                "accountHealth"
            );


        if (accountHealthElement) {

            if (account.score >= 60) {

                accountHealthElement.textContent =
                    "Poor";

            }

            else if (account.score >= 40) {

                accountHealthElement.textContent =
                    "Average";

            }

            else {

                accountHealthElement.textContent =
                    "Good";

            }

        }


        // ==========================================
        // CONFIDENCE LEVEL
        // ==========================================

        const confidenceElement =
            document.getElementById(
                "confidence"
            );


        if (confidenceElement) {

            const reasons =
                account.reasons || [];


            if (reasons.length >= 5) {

                confidenceElement.textContent =
                    "Very High";

            }

            else if (reasons.length >= 3) {

                confidenceElement.textContent =
                    "High";

            }

            else if (reasons.length >= 1) {

                confidenceElement.textContent =
                    "Medium";

            }

            else {

                confidenceElement.textContent =
                    "Low";

            }

        }


        // ==========================================
        // REASONS
        // ==========================================

        const reasonsContainer =
            document.getElementById(
                "reasons"
            );


        if (reasonsContainer) {

            reasonsContainer.innerHTML = "";


            const reasons =
                account.reasons || [];


            if (reasons.length === 0) {

                const item =
                    document.createElement(
                        "li"
                    );

                item.textContent =
                    "No major suspicious indicators detected.";

                reasonsContainer.appendChild(
                    item
                );

            }

            else {

                reasons.forEach(reason => {

                    const item =
                        document.createElement(
                            "li"
                        );

                    item.textContent =
                        reason;

                    reasonsContainer.appendChild(
                        item
                    );

                });

            }

        }

    }

    else {

        resultContainer.innerHTML =
            "<p>No detection result found.</p>";

    }

}


// ==========================================
// HISTORY PAGE
// ==========================================

const historyContainer =
    document.getElementById(
        "historyContainer"
    );

if (historyContainer) {

    let detectionHistory =
        JSON.parse(
            localStorage.getItem(
                "detectionHistory"
            )
        ) || [];


    const searchInput =
        document.getElementById(
            "historySearch"
        );

    const riskFilter =
        document.getElementById(
            "riskFilter"
        );


    function displayHistory(records) {

        historyContainer.innerHTML =
            "";


        if (records.length === 0) {

            historyContainer.innerHTML =
                "<p>No detection history found.</p>";

            return;

        }


        records.forEach((record, index) => {

            const card =
                document.createElement(
                    "div"
                );

            card.className =
                "history-card";


            const score =
                Number(
                    record.score || 0
                );


            let risk =
                record.risk;


            if (!risk) {

                if (score >= 70) {

                    risk =
                        "HIGH RISK";

                }

                else if (score >= 40) {

                    risk =
                        "MEDIUM RISK";

                }

                else {

                    risk =
                        "LOW RISK";

                }

            }


            card.innerHTML = `

                <div class="history-header">

                    <h3>
                        ${record.username || "Unknown"}
                    </h3>

                    <span class="risk-badge">
                        ${risk}
                    </span>

                </div>

                <div class="history-details">

                    <p>
                        <strong>Followers:</strong>
                        ${record.followers ?? 0}
                    </p>

                    <p>
                        <strong>Following:</strong>
                        ${record.following ?? 0}
                    </p>

                    <p>
                        <strong>Posts:</strong>
                        ${record.posts ?? 0}
                    </p>

                    <p>
                        <strong>Fake Probability:</strong>
                        ${score.toFixed(2)}%
                    </p>

                    <p>
                        <strong>Date:</strong>
                        ${record.date || "N/A"}
                    </p>

                </div>

                <div class="history-actions">

                    <button
                        class="view-history-btn"
                        data-index="${index}">
                        View
                    </button>

                    <button
                        class="delete-history-btn"
                        data-index="${index}">
                        Delete
                    </button>

                </div>

            `;


            historyContainer.appendChild(
                card
            );

        });


        // ==========================================
        // VIEW BUTTON
        // ==========================================

        document
            .querySelectorAll(
                ".view-history-btn"
            )
            .forEach(button => {

                button.addEventListener(
                    "click",
                    function () {

                        const index =
                            Number(
                                this.dataset.index
                            );

                        const account =
                            records[index];


                        localStorage.setItem(
                            "selectedAccount",
                            JSON.stringify(
                                account
                            )
                        );


                        window.location.href =
                            "result.html";

                    }
                );

            });


        // ==========================================
        // DELETE BUTTON
        // ==========================================

        document
            .querySelectorAll(
                ".delete-history-btn"
            )
            .forEach(button => {

                button.addEventListener(
                    "click",
                    function () {

                        const index =
                            Number(
                                this.dataset.index
                            );


                        const accountToDelete =
                            records[index];


                        detectionHistory =
                            detectionHistory.filter(
                                record =>
                                    record !==
                                    accountToDelete
                            );


                        localStorage.setItem(
                            "detectionHistory",
                            JSON.stringify(
                                detectionHistory
                            )
                        );


                        displayHistory(
                            detectionHistory
                        );

                    }
                );

            });

    }


    // ==========================================
    // HISTORY FILTER
    // ==========================================

    function filterHistory() {

        const searchTerm =
            searchInput
                ? searchInput.value
                    .toLowerCase()
                    .trim()
                : "";


        const selectedRisk =
            riskFilter
                ? riskFilter.value
                    .toLowerCase()
                : "all";


        const filtered =
            detectionHistory.filter(
                record => {

                    const username =
                        (
                            record.username ||
                            ""
                        ).toLowerCase();


                    const score =
                        Number(
                            record.score || 0
                        );


                    const matchesSearch =
                        username.includes(
                            searchTerm
                        );


                    let riskMatch = true;


                    if (selectedRisk === "high") {

                        riskMatch =
                            Number(record.score) >= 70;

                    }

                    else if (
                        selectedRisk ===
                        "medium"
                    ) {

                        riskMatch =
                            Number(record.score) >= 40 &&
                            Number(record.score) < 70;

                    }

                    else if (
                        selectedRisk ===
                        "low"
                    ) {

                        riskMatch =
                            Number(record.score) < 40;

                    }


                    return (
                        matchesSearch &&
                        riskMatch
                    );

                }
            );


        displayHistory(
            filtered
        );

    }


    if (searchInput) {

        searchInput.addEventListener(
            "input",
            filterHistory
        );

    }


    if (riskFilter) {

        riskFilter.addEventListener(
            "change",
            filterHistory
        );

    }


    displayHistory(
        detectionHistory
    );

    }

// ==========================================
// ANALYSIS REASONS
// ==========================================

const reasonsList =
    document.getElementById("reasonsList");


if (reasonsList) {

    reasonsList.innerHTML = "";


    // GET SELECTED ACCOUNT SAFELY

    const reasonsSavedAccount =
        localStorage.getItem("selectedAccount");


    const reasonsAccount =
        reasonsSavedAccount
            ? JSON.parse(reasonsSavedAccount)
            : null;


    if (
        !reasonsAccount ||
        !reasonsAccount.reasons ||
        reasonsAccount.reasons.length === 0
    ) {

        const listItem =
            document.createElement("li");

        listItem.innerText =
            "No major suspicious activity detected.";

        reasonsList.appendChild(listItem);

    }

    else {

        reasonsAccount.reasons.forEach(
            function (reason) {

                const listItem =
                    document.createElement("li");

                listItem.innerText =
                    reason;

                reasonsList.appendChild(listItem);

            }
        );

    }

}
// ==========================================
// RESULT PAGE - CHECK ANOTHER ACCOUNT
// ==========================================

const checkAgainBtn =
    document.getElementById("checkAgainBtn");

if (checkAgainBtn) {

    checkAgainBtn.addEventListener(
        "click",
        function () {

            window.location.href =
                "detect.html";

        }
    );

}


// ==========================================
// HISTORY PAGE
// ==========================================

const historyTableBody =
    document.getElementById("historyTableBody");

if (historyTableBody) {

    let history =
        JSON.parse(
            localStorage.getItem("detectionHistory")
        ) || [];


    const searchUsername =
        document.getElementById("searchUsername");

    const riskFilter =
        document.getElementById("riskFilter");


    function displayHistory(data) {

        historyTableBody.innerHTML = "";


        if (data.length === 0) {

            historyTableBody.innerHTML = `

                <tr>

                    <td colspan="5">

                        No accounts found.

                    </td>

                </tr>

            `;

            return;

        }


        data.forEach(function (record) {

            const originalIndex =
                history.indexOf(record);


            const row =
                document.createElement("tr");


            row.innerHTML = `

                <td>${record.username}</td>

                <td>${record.score}%</td>

                <td>${record.riskLevel}</td>

                <td>${record.dateTime}</td>

                <td class="action-buttons">

                    <button
                        class="view-btn"
                        data-index="${originalIndex}"
                    >

                        👁️ View

                    </button>


                    <button
                        class="delete-btn"
                        data-index="${originalIndex}"
                    >

                        🗑️ Delete

                    </button>

                </td>

            `;


            historyTableBody.appendChild(row);

        });


        document.querySelectorAll(".view-btn")
            .forEach(function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        const index =
                            Number(button.dataset.index);


                        localStorage.setItem(
                            "selectedAccount",
                            JSON.stringify(history[index])
                        );


                        window.location.href =
                            "result.html";

                    }
                );

            });


        document.querySelectorAll(".delete-btn")
            .forEach(function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        const index =
                            Number(button.dataset.index);


                        const account =
                            history[index];


                        if (
                            confirm(
                                "Delete record for " +
                                account.username +
                                "?"
                            )
                        ) {

                            history.splice(index, 1);


                            localStorage.setItem(
                                "detectionHistory",
                                JSON.stringify(history)
                            );


                            filterHistory();

                        }

                    }
                );

            });

    }


    function filterHistory() {

        const searchText =
            searchUsername
                ? searchUsername.value
                    .toLowerCase()
                    .trim()
                : "";


        const selectedRisk =
            riskFilter
                ? riskFilter.value
                : "all";


        const filteredHistory =
            history.filter(function (record) {

                const usernameMatch =
                    record.username
                        .toLowerCase()
                        .includes(searchText);


                let riskMatch = true;


                if (selectedRisk === "high") {

                    riskMatch =
                        Number(record.score) >= 70;

                }


                else if (selectedRisk === "medium") {

                    riskMatch =
                        Number(record.score) >= 40 &&
                        Number(record.score) < 70;

                }


                else if (selectedRisk === "low") {

                    riskMatch =
                        Number(record.score) < 40;

                }


                return (
                    usernameMatch &&
                    riskMatch
                );

            });


        displayHistory(filteredHistory);

    }


    if (searchUsername) {

        searchUsername.addEventListener(
            "input",
            filterHistory
        );

    }


    if (riskFilter) {

        riskFilter.addEventListener(
            "change",
            filterHistory
        );

    }


    filterHistory();

}


// ==========================================
// HISTORY PAGE - NEW DETECTION
// ==========================================

const newDetectionBtn =
    document.getElementById("newDetectionBtn");


if (newDetectionBtn) {

    newDetectionBtn.addEventListener(
        "click",
        function () {

            window.location.href =
                "detect.html";

        }
    );

}


// ==========================================
// HISTORY PAGE - CLEAR HISTORY
// ==========================================

const clearHistoryBtn =
    document.getElementById("clearHistoryBtn");


if (clearHistoryBtn) {

    clearHistoryBtn.addEventListener(
        "click",
        function () {

            if (
                confirm(
                    "Are you sure you want to clear all detection history?"
                )
            ) {

                localStorage.removeItem(
                    "detectionHistory"
                );


                window.location.reload();

            }

        }
    );

}


// ==========================================
// ANALYTIC DASHBOARD - MYSQL DATA
// ==========================================

const analyticTotal =
    document.getElementById("analyticTotal");


if (analyticTotal) {

    fetch(`${API_BASE_URL}/dashboard-stats`, {
        method: "GET",
        cache: "no-store"
    })

        .then(function(response) {

            if (!response.ok) {

                throw new Error(
                    "Dashboard API Error: " +
                    response.status
                );

            }


            return response.json();

        })


        .then(function(data) {

            if (!data.success) {

                throw new Error(
                    data.error ||
                    "Unable to load dashboard statistics."
                );

            }


            const total =
                Number(data.total) || 0;

            const high =
                Number(data.highRisk) || 0;

            const medium =
                Number(data.mediumRisk) || 0;

            const low =
                Number(data.lowRisk) || 0;


            const totalElement =
                document.getElementById(
                    "analyticTotal"
                );


            const highElement =
                document.getElementById(
                    "analyticHigh"
                );


            const mediumElement =
                document.getElementById(
                    "analyticMedium"
                );


            const lowElement =
                document.getElementById(
                    "analyticLow"
                );


            if (totalElement) {

                totalElement.innerText =
                    total;

            }


            if (highElement) {

                highElement.innerText =
                    high;

            }


            if (mediumElement) {

                mediumElement.innerText =
                    medium;

            }


            if (lowElement) {

                lowElement.innerText =
                    low;

            }


            const highPercentage =
                total > 0
                    ? Math.round(
                        (high / total) * 100
                    )
                    : 0;


            const mediumPercentage =
                total > 0
                    ? Math.round(
                        (medium / total) * 100
                    )
                    : 0;


            const lowPercentage =
                total > 0
                    ? Math.round(
                        (low / total) * 100
                    )
                    : 0;


            const highPercentageElement =
                document.getElementById(
                    "highPercentage"
                );


            const mediumPercentageElement =
                document.getElementById(
                    "mediumPercentage"
                );


            const lowPercentageElement =
                document.getElementById(
                    "lowPercentage"
                );


            if (highPercentageElement) {

                highPercentageElement.innerText =
                    highPercentage + "%";

            }


            if (mediumPercentageElement) {

                mediumPercentageElement.innerText =
                    mediumPercentage + "%";

            }


            if (lowPercentageElement) {

                lowPercentageElement.innerText =
                    lowPercentage + "%";

            }


            const highBar =
                document.getElementById(
                    "highBar"
                );


            const mediumBar =
                document.getElementById(
                    "mediumBar"
                );


            const lowBar =
                document.getElementById(
                    "lowBar"
                );


            if (highBar) {

                highBar.style.width =
                    highPercentage + "%";

            }


            if (mediumBar) {

                mediumBar.style.width =
                    mediumPercentage + "%";

            }


            if (lowBar) {

                lowBar.style.width =
                    lowPercentage + "%";

            }

        })


        .catch(function(error) {

            console.error(
                "Analytics Dashboard Error:",
                error
            );

        });

}


// ==========================================
// ANALYTIC - NEW DETECTION BUTTON
// ==========================================

const analyticNewDetectionBtn =
    document.getElementById(
        "analyticNewDetectionBtn"
    );


if (analyticNewDetectionBtn) {

    analyticNewDetectionBtn.addEventListener(
        "click",
        function () {

            window.location.href =
                "detect.html";

        }
    );

}


// ==========================================
// ANALYTIC - HISTORY BUTTON
// ==========================================

const analyticHistoryBtn =
    document.getElementById(
        "analyticHistoryBtn"
    );


if (analyticHistoryBtn) {

    analyticHistoryBtn.addEventListener(
        "click",
        function () {

            window.location.href =
                "history.html";

        }
    );

}


// ==========================================
// ANALYTIC - HOME BUTTON
// ==========================================

const analyticHomeBtn =
    document.getElementById(
        "analyticHomeBtn"
    );


if (analyticHomeBtn) {

    analyticHomeBtn.addEventListener(
        "click",
        function () {

            window.location.href =
                "index.html";

        }
    );

}


// ==========================================
// DOWNLOAD DETECTION REPORT
// ==========================================

const downloadReportBtn =
    document.getElementById(
        "downloadReportBtn"
    );


if (downloadReportBtn) {

    downloadReportBtn.addEventListener(
        "click",
        function () {


            // ==========================================
            // GET SELECTED ACCOUNT
            // ==========================================

            const savedAccount =
                localStorage.getItem(
                    "selectedAccount"
                );


            if (!savedAccount) {

                alert(
                    "No account report available!"
                );

                return;

            }


            const account =
                JSON.parse(savedAccount);


            // ==========================================
            // CALCULATE ADVANCED VALUES
            // ==========================================

            const fakeProbability =
                Number(account.score);


            const trustScore =
                100 - Number(account.score);


            let accountHealth = "";


            if (account.score >= 70) {

                accountHealth =
                    "Poor";

            }


            else if (account.score >= 40) {

                accountHealth =
                    "Average";

            }


            else {

                accountHealth =
                    "Good";

            }


            let confidence = "";


            const mlConfidence =
                Number(account.confidence);


            if (mlConfidence >= 70) {

                confidence =
                    "Very High";

            }


            else if (mlConfidence >= 40) {

                confidence =
                    "High";

            }


            else {

                confidence =
                    "Low";

            }


            // ==========================================
            // GENERATE AI SUMMARY
            // ==========================================

            let summary = "";


            if (account.score >= 70) {

                summary =
                    "Multiple suspicious patterns were detected. " +
                    "This account may contain characteristics commonly associated " +
                    "with fake or suspicious social media profiles. " +
                    "Careful verification is recommended.";

            }


            else if (account.score >= 40) {

                summary =
                    "Some suspicious patterns were detected. " +
                    "Additional verification is recommended before trusting " +
                    "or interacting with this account.";

            }


            else {

                summary =
                    "The account appears to contain mostly genuine characteristics. " +
                    "No major suspicious patterns were detected based on " +
                    "the provided information.";

            }


            // ==========================================
            // CREATE REASONS LIST
            // ==========================================

            let reasonsText = "";


            if (
                !account.reasons ||
                account.reasons.length === 0
            ) {

                reasonsText =
                    "No major suspicious activity detected.";

            }


            else {

                account.reasons.forEach(
                    function (reason, index) {

                        reasonsText +=
                            (index + 1) +
                            ". " +
                            reason +
                            "\n";

                    }
                );

            }


            // ==========================================
            // CREATE PROFESSIONAL REPORT
            // ==========================================

            const report =

`====================================================
        FAKE ACCOUNT DETECTION SYSTEM
            ACCOUNT ANALYSIS REPORT
====================================================

DETECTION DATE:
${account.dateTime}

----------------------------------------------------
BASIC ACCOUNT INFORMATION
----------------------------------------------------

Username: ${account.username}
Followers: ${account.followers}
Following: ${account.following}
Total Posts: ${account.posts}
Account Age: ${account.accountAge} Days


----------------------------------------------------
ACCOUNT STATISTICS
----------------------------------------------------

Average Likes: ${account.averageLikes}
Average Comments: ${account.averageComments}
Engagement Rate: ${account.engagement}%


----------------------------------------------------
PROFILE INFORMATION
----------------------------------------------------

Profile Picture: ${account.profilePicture}
Bio Available: ${account.bio}
Verified Account: ${account.verified}


----------------------------------------------------
RISK ANALYSIS
----------------------------------------------------

Detection Result: ${account.result}

Risk Level: ${account.riskLevel}

Risk Score: ${account.score}%

Fake Probability: ${fakeProbability}%

Trust Score: ${trustScore}%

Account Health: ${accountHealth}

Detection Confidence: ${confidence}


----------------------------------------------------
AI ANALYSIS SUMMARY
----------------------------------------------------

${summary}


----------------------------------------------------
ANALYSIS REASONS
----------------------------------------------------

${reasonsText}


====================================================
DISCLAIMER
====================================================

This report is generated using a rule-based social
media account analysis system. The result should be
used as an indication only and should not be treated
as absolute proof that an account is fake.

====================================================
END OF REPORT
====================================================`;


            // ==========================================
            // CREATE TEXT FILE
            // ==========================================

            const blob =
                new Blob(
                    [report],
                    {
                        type: "text/plain"
                    }
                );


            const downloadLink =
                document.createElement("a");


            downloadLink.href =
                URL.createObjectURL(blob);


            downloadLink.download =
                `${account.username}_Detection_Report.txt`;


            document.body.appendChild(
                downloadLink
            );


            downloadLink.click();


            document.body.removeChild(
                downloadLink
            );


            URL.revokeObjectURL(
                downloadLink.href
            );


        }
    );

}


// ==========================================
// DARK MODE / LIGHT MODE SYSTEM
// ==========================================

const themeToggle =
    document.getElementById("themeToggle");


// ==========================================
// LOAD SAVED THEME
// ==========================================

const savedTheme =
    localStorage.getItem("theme");


if (savedTheme === "dark") {

    document.body.classList.add(
        "dark-mode"
    );


    if (themeToggle) {

        themeToggle.innerText = "☀️";

    }

}


// ==========================================
// TOGGLE THEME
// ==========================================

if (themeToggle) {

    themeToggle.addEventListener(
        "click",
        function () {


            document.body.classList.toggle(
                "dark-mode"
            );


            // CHECK CURRENT THEME

            if (
                document.body.classList.contains(
                    "dark-mode"
                )
            ) {

                // SAVE DARK THEME

                localStorage.setItem(
                    "theme",
                    "dark"
                );


                themeToggle.innerText =
                    "☀️";

            }


            else {

                // SAVE LIGHT THEME

                localStorage.setItem(
                    "theme",
                    "light"
                );


                themeToggle.innerText =
                    "🌙";

            }

        }
    );

}

// ==========================================
// ANALYTIC CHARTS - MYSQL DATA
// ==========================================

const riskDistributionCanvas =
    document.getElementById(
        "riskDistributionChart"
    );

const riskComparisonCanvas =
    document.getElementById(
        "riskComparisonChart"
    );


if (
    (riskDistributionCanvas ||
        riskComparisonCanvas) &&
    typeof Chart !== "undefined"
) {

    fetch(`${API_BASE_URL}/dashboard-stats`, {
        method: "GET",
        cache: "no-store"
    })

        .then(function(response) {

            if (!response.ok) {

                throw new Error(
                    "Analytics Stats API Error: " +
                    response.status
                );

            }

            return response.json();

        })


        .then(function(data) {

            if (!data.success) {

                throw new Error(
                    data.error ||
                    "Unable to load chart statistics."
                );

            }


            // ==========================================
            // GET MYSQL RISK DATA
            // ==========================================

            const highRisk =
                Number(data.highRisk) || 0;

            const mediumRisk =
                Number(data.mediumRisk) || 0;

            const lowRisk =
                Number(data.lowRisk) || 0;


            // ==========================================
            // RISK DISTRIBUTION - DOUGHNUT CHART
            // ==========================================

            if (riskDistributionCanvas) {

                const oldDoughnut =
                    Chart.getChart(
                        riskDistributionCanvas
                    );

                if (oldDoughnut) {

                    oldDoughnut.destroy();

                }


                new Chart(
                    riskDistributionCanvas,
                    {

                        type: "doughnut",

                        data: {

                            labels: [
                                "High Risk",
                                "Medium Risk",
                                "Low Risk"
                            ],

                            datasets: [
                                {

                                    data: [
                                        highRisk,
                                        mediumRisk,
                                        lowRisk
                                    ],

                                    backgroundColor: [
                                        "#e74c3c",
                                        "#f39c12",
                                        "#2ecc71"
                                    ],

                                    borderWidth: 2

                                }
                            ]

                        },

                        options: {

                            responsive: true,
                            maintainAspectRatio: true,

                            plugins: {

                                legend: {
                                    position: "bottom"
                                }

                            }

                        }

                    }
                );

            }


            // ==========================================
            // RISK COMPARISON - BAR CHART
            // ==========================================

            if (riskComparisonCanvas) {

                const oldBar =
                    Chart.getChart(
                        riskComparisonCanvas
                    );

                if (oldBar) {

                    oldBar.destroy();

                }


                new Chart(
                    riskComparisonCanvas,
                    {

                        type: "bar",

                        data: {

                            labels: [
                                "High Risk",
                                "Medium Risk",
                                "Low Risk"
                            ],

                            datasets: [
                                {

                                    label:
                                        "Number of Accounts",

                                    data: [
                                        highRisk,
                                        mediumRisk,
                                        lowRisk
                                    ],

                                    backgroundColor: [
                                        "#e74c3c",
                                        "#f39c12",
                                        "#2ecc71"
                                    ],

                                    borderRadius: 8

                                }
                            ]

                        },

                        options: {

                            responsive: true,
                            maintainAspectRatio: true,

                            scales: {

                                y: {

                                    beginAtZero: true,

                                    ticks: {
                                        precision: 0
                                    }

                                }

                            },

                            plugins: {

                                legend: {
                                    display: false
                                }

                            }

                        }

                    }
                );

            }

        })

        .catch(function(error) {

            console.error(
                "Analytics Charts Error:",
                error
            );

        });

}


// ==========================================
// MOST RECENT DETECTION + DETECTION TREND
// MYSQL
// ==========================================

const detectionTrendCanvas =
    document.getElementById("detectionTrendChart");

// ==========================================
// LOAD DETECTION HISTORY FROM MYSQL
// ==========================================

fetch(`${API_BASE_URL}/dashboard-history`, {
    method: "GET",
    cache: "no-store"
})

.then(function(response) {

    if (!response.ok) {

        throw new Error(
            "Dashboard History API Error: " +
            response.status
        );

    }

    return response.json();

})


.then(function(data) {

    if (!data.success) {

        throw new Error(
            data.error ||
            "Unable to load detection history."
        );

    }


    const history =
        Array.isArray(data.history)
            ? data.history
            : [];


    // ==========================================
    // MOST RECENT DETECTION
    // ==========================================

    if (history.length > 0) {

        const latest =
            history[0];


        const fakeProbability =
            Number(
                latest.fakeProbability
            ) || 0;


        const genuineProbability =
            Number(
                latest.genuineProbability
            ) || 0;


        /*
         * Find the "No detection data available yet."
         * element from the existing HTML.
         */

        const allElements =
            document.querySelectorAll("*");


        let recentMessage = null;


        allElements.forEach(function(element) {

            if (
                element.children.length === 0 &&
                element.textContent
                    .trim()
                    .includes(
                        "No detection data available yet"
                    )
            ) {

                recentMessage = element;

            }

        });


        if (recentMessage) {

            recentMessage.innerHTML = `

                <div style="
                    padding: 10px;
                    text-align: center;
                ">

                    <h3 style="
                        margin: 5px 0 10px;
                    ">
                        👤 ${latest.username || "Unknown"}
                    </h3>

                    <p style="
                        margin: 5px 0;
                    ">
                        📊 Fake Probability:
                        <strong>
                            ${fakeProbability}%
                        </strong>
                    </p>

                    <p style="
                        margin: 5px 0;
                    ">
                        🛡️ Genuine Probability:
                        <strong>
                            ${genuineProbability}%
                        </strong>
                    </p>

                    <p style="
                        margin: 5px 0;
                        font-weight: bold;
                    ">
                        ${latest.riskLevel || "UNKNOWN"}
                    </p>

                    <p style="
                        margin: 5px 0;
                        font-size: 12px;
                    ">
                        🕒 ${latest.created_at || ""}
                    </p>

                </div>

            `;

        }

    }


    // ==========================================
    // NO DETECTION HISTORY
    // ==========================================

    if (history.length === 0) {

        console.log(
            "No detection history available."
        );

        return;

    }


    // ==========================================
    // DETECTION TREND
    // ==========================================

    if (
        detectionTrendCanvas &&
        typeof Chart !== "undefined"
    ) {


        // ======================================
        // FIX CHART CONTAINER HEIGHT
        // ======================================

        const chartContainer =
            detectionTrendCanvas.parentElement;


        if (chartContainer) {

            chartContainer.style.height =
                "300px";

            chartContainer.style.position =
                "relative";

        }


        detectionTrendCanvas.style.width =
            "100%";


        detectionTrendCanvas.style.height =
            "280px";


        // ======================================
        // OLDEST → NEWEST
        // ======================================

        const records =
            history
                .slice()
                .reverse();


        // ======================================
        // LABELS
        // ======================================

        const labels =
            records.map(function(item) {

                return item.username ||
                    "Unknown";

            });


        // ======================================
        // FAKE DATA
        // ======================================

        const fakeData =
            records.map(function(item) {

                return Number(
                    item.fakeProbability
                ) || 0;

            });


        // ======================================
        // GENUINE DATA
        // ======================================

        const genuineData =
            records.map(function(item) {

                return Number(
                    item.genuineProbability
                ) || 0;

            });


        // ======================================
        // DESTROY OLD CHART
        // ======================================

        const oldChart =
            Chart.getChart(
                detectionTrendCanvas
            );


        if (oldChart) {

            oldChart.destroy();

        }


        // ======================================
        // CREATE TREND CHART
        // ======================================

        new Chart(
            detectionTrendCanvas,
            {

                type: "line",

                data: {

                    labels: labels,

                    datasets: [


                        {

                            label:
                                "Fake Probability (%)",

                            data:
                                fakeData,

                            borderColor:
                                "#e74c3c",

                            backgroundColor:
                                "rgba(231, 76, 60, 0.12)",

                            borderWidth: 3,

                            tension: 0.35,

                            fill: true,

                            pointRadius: 5,

                            pointHoverRadius: 7

                        },


                        {

                            label:
                                "Genuine Probability (%)",

                            data:
                                genuineData,

                            borderColor:
                                "#2ecc71",

                            backgroundColor:
                                "rgba(46, 204, 113, 0.12)",

                            borderWidth: 3,

                            tension: 0.35,

                            fill: true,

                            pointRadius: 5,

                            pointHoverRadius: 7

                        }

                    ]

                },


                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    animation: false,


                    scales: {

                        y: {

                            beginAtZero: true,

                            max: 100,

                            ticks: {

                                stepSize: 20

                            },

                            title: {

                                display: true,

                                text:
                                    "Probability (%)"

                            }

                        },


                        x: {

                            title: {

                                display: true,

                                text:
                                    "Analyzed Accounts"

                            }

                        }

                    },


                    plugins: {

                        legend: {

                            display: true,

                            position: "bottom"

                        },


                        tooltip: {

                            enabled: true

                        }

                    }

                }

            }
        );

    }

})


.catch(function(error) {

    console.error(
        "Recent Detection / Trend Error:",
        error
    );

});


// ==========================================
// ACCOUNT COMPARISON SYSTEM
// ==========================================

const compareAccount1 =
    document.getElementById(
        "compareAccount1"
    );

const compareAccount2 =
    document.getElementById(
        "compareAccount2"
    );

const compareBtn =
    document.getElementById(
        "compareBtn"
    );

const comparisonResult =
    document.getElementById(
        "comparisonResult"
    );


// ==========================================
// LOAD HISTORY INTO SELECT BOXES
// ==========================================

if (compareAccount1 && compareAccount2) {

    const comparisonHistory =
        JSON.parse(
            localStorage.getItem(
                "detectionHistory"
            )
        ) || [];


    if (comparisonHistory.length === 0) {

        comparisonResult.innerHTML = `
            <div class="comparison-placeholder">

                ⚠️ No detection history available.

                <br><br>

                Please analyze some accounts first.

            </div>
        `;

    }

    else {

        comparisonHistory.forEach(
            function (account, index) {

                const option1 =
                    document.createElement(
                        "option"
                    );

                option1.value = index;

                option1.textContent =
                    account.username +
                    " (" +
                    account.score +
                    "% Risk)";


                compareAccount1.appendChild(
                    option1
                );


                const option2 =
                    document.createElement(
                        "option"
                    );

                option2.value = index;

                option2.textContent =
                    account.username +
                    " (" +
                    account.score +
                    "% Risk)";


                compareAccount2.appendChild(
                    option2
                );

            }
        );

    }


    // ==========================================
    // COMPARE ACCOUNTS
    // ==========================================

    if (compareBtn) {

        compareBtn.addEventListener(
            "click",
            function () {

                const index1 =
                    compareAccount1.value;

                const index2 =
                    compareAccount2.value;


                // VALIDATION

                if (
                    index1 === "" ||
                    index2 === ""
                ) {

                    alert(
                        "Please select both accounts!"
                    );

                    return;

                }


                if (index1 === index2) {

                    alert(
                        "Please select two different accounts!"
                    );

                    return;

                }


                const account1 =
                    comparisonHistory[index1];

                const account2 =
                    comparisonHistory[index2];


                // ======================================
                // CREATE COMPARISON TABLE
                // ======================================

                comparisonResult.innerHTML = `

                    <div class="comparison-table-container">

                        <table class="comparison-table">

                            <thead>

                                <tr>

                                    <th>
                                        Feature
                                    </th>

                                    <th>
                                        👤 ${account1.username}
                                    </th>

                                    <th>
                                        👤 ${account2.username}
                                    </th>

                                </tr>

                            </thead>


                            <tbody>


                                <tr>

                                    <td>
                                        Followers
                                    </td>

                                    <td>
                                        ${account1.followers}
                                    </td>

                                    <td>
                                        ${account2.followers}
                                    </td>

                                </tr>


                                <tr>

                                    <td>
                                        Following
                                    </td>

                                    <td>
                                        ${account1.following}
                                    </td>

                                    <td>
                                        ${account2.following}
                                    </td>

                                </tr>


                                <tr>

                                    <td>
                                        Total Posts
                                    </td>

                                    <td>
                                        ${account1.posts}
                                    </td>

                                    <td>
                                        ${account2.posts}
                                    </td>

                                </tr>


                                <tr>

                                    <td>
                                        Account Age
                                    </td>

                                    <td>
                                        ${account1.accountAge} Days
                                    </td>

                                    <td>
                                        ${account2.accountAge} Days
                                    </td>

                                </tr>


                                <tr>

                                    <td>
                                        Average Likes
                                    </td>

                                    <td>
                                        ${account1.averageLikes}
                                    </td>

                                    <td>
                                        ${account2.averageLikes}
                                    </td>

                                </tr>


                                <tr>

                                    <td>
                                        Average Comments
                                    </td>

                                    <td>
                                        ${account1.averageComments}
                                    </td>

                                    <td>
                                        ${account2.averageComments}
                                    </td>

                                </tr>


                                <tr>

                                    <td>
                                        Engagement Rate
                                    </td>

                                                                    <tr>

                                    <td>
                                        Profile Picture
                                    </td>

                                    <td>
                                        ${
                                            account1.profilePicture === "yes"
                                                ? "Available ✅"
                                                : "Not Available ❌"
                                        }
                                    </td>

                                    <td>
                                        ${
                                            account2.profilePicture === "yes"
                                                ? "Available ✅"
                                                : "Not Available ❌"
                                        }
                                    </td>

                                </tr>


                                <tr>

                                    <td>
                                        Bio
                                    </td>

                                    <td>
                                        ${
                                            account1.bio === "yes"
                                                ? "Available ✅"
                                                : "Not Available ❌"
                                        }
                                    </td>

                                    <td>
                                        ${
                                            account2.bio === "yes"
                                                ? "Available ✅"
                                                : "Not Available ❌"
                                        }
                                    </td>

                                </tr>


                                <tr>

                                    <td>
                                        Verified
                                    </td>

                                    <td>
                                        ${
                                            account1.verified === "yes"
                                                ? "Verified ✅"
                                                : "Not Verified ❌"
                                        }
                                    </td>

                                    <td>
                                        ${
                                            account2.verified === "yes"
                                                ? "Verified ✅"
                                                : "Not Verified ❌"
                                        }
                                    </td>

                                </tr>


                                <tr>

                                    <td>
                                        Risk Score
                                    </td>

                                    <td>
                                        ${account1.score}%
                                    </td>

                                    <td>
                                        ${account2.score}%
                                    </td>

                                </tr>


                                <tr>

                                    <td>
                                        Risk Level
                                    </td>

                                    <td>
                                        ${account1.riskLevel}
                                    </td>

                                    <td>
                                        ${account2.riskLevel}
                                    </td>

                                </tr>


                            </tbody>

                        </table>

                    </div>

                `;

            }

        );

    }

}


// ==========================================
// COMPARE PAGE NAVIGATION
// ==========================================

const compareNewDetectionBtn =
    document.getElementById(
        "compareNewDetectionBtn"
    );


if (compareNewDetectionBtn) {

    compareNewDetectionBtn.addEventListener(
        "click",
        function () {

            window.location.href =
                "detect.html";

        }
    );

}


const compareHistoryBtn =
    document.getElementById(
        "compareHistoryBtn"
    );


if (compareHistoryBtn) {

    compareHistoryBtn.addEventListener(
        "click",
        function () {

            window.location.href =
                "history.html";

        }
    );

}


const compareHomeBtn =
    document.getElementById(
        "compareHomeBtn"
    );


if (compareHomeBtn) {

    compareHomeBtn.addEventListener(
        "click",
        function () {

            window.location.href =
                "index.html";

        }
    );

}


const openCompareBtn =
    document.getElementById(
        "openCompareBtn"
    );


if (openCompareBtn) {

    openCompareBtn.addEventListener(
        "click",
        function () {

            window.location.href =
                "compare.html";

        }
    );

}


// ==========================================
// VIEW DETECTION HISTORY BUTTON
// ==========================================

const viewHistoryBtn =
    document.getElementById(
        "viewHistoryBtn"
    );


if (viewHistoryBtn) {

    viewHistoryBtn.addEventListener(
        "click",
        function () {

            window.location.href =
                "history.html";

        }
    );

}

