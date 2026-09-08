// ========================================
// KABARU WARD FOOTBALL
// Team Registration
// ========================================

document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("teamRegistrationForm");
    const playersContainer = document.getElementById("playersContainer");
    const addPlayerBtn = document.getElementById("addPlayerBtn");
    const playerCount = document.getElementById("playerCount");
    const message = document.getElementById("registrationMessage");

    let playerNumber = 0;


    // ========================================
    // ADD PLAYER
    // ========================================

    function addPlayer() {

        if (playerNumber >= 20) {
            alert("A team can have a maximum of 20 players.");
            return;
        }

        playerNumber++;

        const player = document.createElement("div");

        player.className = "player-row";

        player.innerHTML = `
            <div class="player-number">${playerNumber}</div>

            <input
                type="text"
                name="player_name"
                placeholder="Full name"
                required
            >

            <input
                type="number"
                name="jersey_number"
                placeholder="Jersey No."
                min="1"
                max="99"
                required
            >

            <select name="position" required>
                <option value="">Position</option>
                <option value="Goalkeeper">Goalkeeper</option>
                <option value="Defender">Defender</option>
                <option value="Midfielder">Midfielder</option>
                <option value="Forward">Forward</option>
            </select>

            <button type="button" class="remove-player">
                Remove
            </button>
        `;

        player
            .querySelector(".remove-player")
            .addEventListener("click", () => {

                player.remove();
                updatePlayerNumbers();

            });

        playersContainer.appendChild(player);

        updatePlayerNumbers();
    }


    // ========================================
    // UPDATE PLAYER NUMBERS
    // ========================================

    function updatePlayerNumbers() {

        const rows =
            playersContainer.querySelectorAll(".player-row");

        playerNumber = rows.length;

        rows.forEach((row, index) => {

            row.querySelector(".player-number").textContent =
                index + 1;

        });

        playerCount.textContent =
            `${playerNumber}/20 players`;

        if (playerNumber >= 20) {

            addPlayerBtn.disabled = true;

            addPlayerBtn.textContent =
                "Maximum 20 Players";

        } else {

            addPlayerBtn.disabled = false;

            addPlayerBtn.textContent =
                "+ Add Player";
        }
    }


    // ========================================
    // START WITH ONE PLAYER
    // ========================================

    addPlayer();


    // ========================================
    // ADD PLAYER BUTTON
    // ========================================

    addPlayerBtn.addEventListener("click", addPlayer);


    // ========================================
    // SUBMIT REGISTRATION
    // ========================================

    form.addEventListener("submit", async (event) => {

        event.preventDefault();

        message.className =
            "registration-message loading";

        message.innerHTML =
            "<p>Submitting registration...</p>";

        const submitButton =
            form.querySelector("button[type='submit']");

        submitButton.disabled = true;


        try {

            // ========================================
            // TEAM DETAILS
            // ========================================

            const team = {

                name:
                    document.getElementById("teamName")
                        .value.trim(),

                short_name:
                    document.getElementById("shortName")
                        .value.trim(),

                location:
                    document.getElementById("teamLocation")
                        .value.trim(),

                coach_name:
                    document.getElementById("coachName")
                        .value.trim(),

                captain_name:
                    document.getElementById("captainName")
                        .value.trim(),

                vice_captain_name:
                    document.getElementById("viceCaptainName")
                        .value.trim(),

                discipline_master_name:
                    document.getElementById("disciplineMasterName")
                        .value.trim(),

                phone:
                    document.getElementById("teamPhone")
                        .value.trim(),

                email:
                    document.getElementById("teamEmail")
                        .value.trim()
            };


            // ========================================
            // COLLECT PLAYERS
            // ========================================

            const playerRows =
                playersContainer.querySelectorAll(".player-row");


            if (playerRows.length === 0) {

                throw new Error(
                    "Please add at least one player."
                );
            }


            if (playerRows.length > 20) {

                throw new Error(
                    "A maximum of 20 players is allowed."
                );
            }


            const players = [];


            playerRows.forEach(row => {

                const fullName =
                    row.querySelector(
                        'input[name="player_name"]'
                    ).value.trim();

                const jerseyNumber =
                    parseInt(
                        row.querySelector(
                            'input[name="jersey_number"]'
                        ).value
                    );

                const position =
                    row.querySelector(
                        'select[name="position"]'
                    ).value;


                if (!fullName) {

                    throw new Error(
                        "Every player must have a full name."
                    );
                }


                if (
                    !Number.isInteger(jerseyNumber) ||
                    jerseyNumber < 1 ||
                    jerseyNumber > 99
                ) {

                    throw new Error(
                        "Jersey numbers must be between 1 and 99."
                    );
                }


                if (!position) {

                    throw new Error(
                        "Please select a position for every player."
                    );
                }


                players.push({

                    full_name: fullName,

                    jersey_number: jerseyNumber,

                    position: position

                });

            });


            // ========================================
            // CHECK DUPLICATE JERSEY NUMBERS
            // ========================================

            const jerseyNumbers =
                players.map(
                    player => player.jersey_number
                );

            const uniqueNumbers =
                new Set(jerseyNumbers);


            if (
                uniqueNumbers.size !==
                jerseyNumbers.length
            ) {

                throw new Error(
                    "Each player must have a different jersey number."
                );
            }


            console.log("TEAM:", team);
            console.log("PLAYERS:", players);


            // ========================================
            // SEND TEAM + PLAYERS TO SUPABASE
            // ========================================

            const { data: teamId, error } =
                await supabaseClient.rpc(
                    "submit_team_registration",
                    {

                        p_name:
                            team.name,

                        p_short_name:
                            team.short_name,

                        p_location:
                            team.location,

                        p_coach_name:
                            team.coach_name,

                        p_captain_name:
                            team.captain_name,

                        p_vice_captain_name:
                            team.vice_captain_name,

                        p_discipline_master_name:
                            team.discipline_master_name,

                        p_phone:
                            team.phone,

                        p_email:
                            team.email,

                        p_players:
                            players
                    }
                );


            console.log(
                "SUPABASE RESULT:",
                teamId,
                error
            );


            if (error) {

                throw error;
            }


            // ========================================
            // SUCCESS
            // ========================================

            message.className =
                "registration-message success";

            message.innerHTML = `

                <h3>✅ Registration Submitted!</h3>

                <p>
                    <strong>
                        ${escapeHtml(team.name)}
                    </strong>
                    has been successfully submitted.
                </p>

                <p>
                    Your team and
                    <strong>${players.length}</strong>
                    player(s) are currently
                    <strong>Pending Approval</strong>.
                </p>

                <p>
                    The Kabaru Ward Football administrator
                    will review the registration.
                </p>

            `;


            // Reset form

            form.reset();

            playersContainer.innerHTML = "";

            playerNumber = 0;

            addPlayer();


            window.scrollTo({

                top:
                    message.offsetTop - 100,

                behavior:
                    "smooth"

            });


        } catch (error) {

            console.error(
                "REGISTRATION ERROR:",
                error
            );


            message.className =
                "registration-message error";


            message.innerHTML = `

                <h3>❌ Registration Failed</h3>

                <p>
                    ${escapeHtml(
                        error.message ||
                        "Something went wrong. Please try again."
                    )}
                </p>

            `;

        } finally {

            submitButton.disabled = false;

        }

    });


    // ========================================
    // ESCAPE HTML
    // ========================================

    function escapeHtml(value) {

        return String(value)

            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

});
// ========================================
// KABARU WARD FOOTBALL
// PUBLIC FIXTURE LOADER
// ========================================

document.addEventListener("DOMContentLoaded", () => {

    loadPublicFixtures();

});


// ========================================
// LOAD PUBLIC FIXTURES
// ========================================

async function loadPublicFixtures() {

    const fixturesContainer =
        document.getElementById("upcomingFixtures");

    // If the fixture section does not exist,
    // do nothing.
    if (!fixturesContainer) {
        return;
    }

    try {

        // ========================================
        // GET FIXTURES
        // ========================================

        const {
            data: fixtures,
            error: fixturesError
        } = await supabaseClient
            .from("fixtures")
            .select(`
                id,
                competition_id,
                home_team_id,
                away_team_id,
                match_date,
                kick_off,
                venue,
                matchday,
                status
            `)
            .in("status", ["Scheduled", "Published"])
            .order("match_date", {
                ascending: true
            })
            .order("kick_off", {
                ascending: true
            });


        if (fixturesError) {
            throw fixturesError;
        }


        // ========================================
        // NO FIXTURES
        // ========================================

        if (!fixtures || fixtures.length === 0) {

            fixturesContainer.innerHTML = `

                <div class="card" style="text-align:center;">

                    <h3>⚽ No Upcoming Fixtures</h3>

                    <p>
                        Fixtures will appear here once
                        they are published by the administrator.
                    </p>

                </div>

            `;

            return;
        }


        // ========================================
        // GET TEAMS
        // ========================================

        const {
            data: teams,
            error: teamsError
        } = await supabaseClient
            .from("teams")
            .select(`
                id,
                name,
                short_name,
                logo_url,
                registration_status
            `)
            .eq("registration_status", "Approved");


        if (teamsError) {
            throw teamsError;
        }


        // ========================================
        // GET COMPETITIONS
        // ========================================

        const {
            data: competitions,
            error: competitionsError
        } = await supabaseClient
            .from("competitions")
            .select(`
                id,
                name,
                season,
                status
            `);


        if (competitionsError) {
            throw competitionsError;
        }


        // ========================================
        // CREATE QUICK LOOKUP MAPS
        // ========================================

        const teamMap = {};

        (teams || []).forEach(team => {

            teamMap[team.id] = team;

        });


        const competitionMap = {};

        (competitions || []).forEach(competition => {

            competitionMap[competition.id] = competition;

        });


        // ========================================
        // BUILD FIXTURE CARDS
        // ========================================

        fixturesContainer.innerHTML = "";


        fixtures.forEach(fixture => {

            const homeTeam =
                teamMap[fixture.home_team_id];

            const awayTeam =
                teamMap[fixture.away_team_id];

            const competition =
                competitionMap[fixture.competition_id];


            // Ignore fixtures where the teams
            // are no longer publicly available.
            if (!homeTeam || !awayTeam) {
                return;
            }


            // ========================================
            // FORMAT DATE
            // ========================================

            let formattedDate =
                "Date TBA";

            if (fixture.match_date) {

                const date =
                    new Date(
                        fixture.match_date + "T00:00:00"
                    );

                formattedDate =
                    date.toLocaleDateString(
                        "en-KE",
                        {
                            weekday: "long",
                            day: "numeric",
                            month: "short",
                            year: "numeric"
                        }
                    );
            }


            // ========================================
            // FORMAT KICK-OFF
            // ========================================

            let formattedTime =
                "Time TBA";

            if (fixture.kick_off) {

                const timeParts =
                    fixture.kick_off.split(":");

                const hours =
                    parseInt(timeParts[0], 10);

                const minutes =
                    timeParts[1];

                const period =
                    hours >= 12 ? "PM" : "AM";

                const displayHour =
                    hours % 12 || 12;

                formattedTime =
                    `${displayHour}:${minutes} ${period}`;
            }


            // ========================================
            // CREATE CARD
            // ========================================

            const card =
                document.createElement("div");

            card.className = "card fixture-card";


            card.innerHTML = `

                <div style="
                    text-align:center;
                    padding:10px;
                ">

                    <p style="
                        font-weight:bold;
                        margin-bottom:10px;
                    ">
                        🏆 ${escapeFixtureHtml(
                            competition
                                ? competition.name
                                : "Football Match"
                        )}
                    </p>


                    ${
                        fixture.matchday
                        ? `
                            <p style="
                                font-size:14px;
                                margin-bottom:15px;
                            ">
                                🔢 Matchday
                                ${escapeFixtureHtml(
                                    fixture.matchday
                                )}
                            </p>
                        `
                        : ""
                    }


                    <div style="
                        display:flex;
                        justify-content:center;
                        align-items:center;
                        gap:15px;
                        margin:20px 0;
                    ">

                        <div style="
                            flex:1;
                            text-align:center;
                        ">

                            ${
                                homeTeam.logo_url
                                ? `
                                    <img
                                        src="${escapeFixtureHtml(
                                            homeTeam.logo_url
                                        )}"
                                        alt="${escapeFixtureHtml(
                                            homeTeam.name
                                        )}"
                                        style="
                                            width:60px;
                                            height:60px;
                                            object-fit:contain;
                                            margin-bottom:8px;
                                        "
                                    >
                                `
                                : `
                                    <div style="
                                        font-size:40px;
                                        margin-bottom:8px;
                                    ">
                                        ⚽
                                    </div>
                                `
                            }

                            <h3 style="
                                margin:0;
                            ">
                                ${escapeFixtureHtml(
                                    homeTeam.name
                                )}
                            </h3>

                            <small>
                                ${escapeFixtureHtml(
                                    homeTeam.short_name || ""
                                )}
                            </small>

                        </div>


                        <div style="
                            font-size:22px;
                            font-weight:bold;
                        ">
                            VS
                        </div>


                        <div style="
                            flex:1;
                            text-align:center;
                        ">

                            ${
                                awayTeam.logo_url
                                ? `
                                    <img
                                        src="${escapeFixtureHtml(
                                            awayTeam.logo_url
                                        )}"
                                        alt="${escapeFixtureHtml(
                                            awayTeam.name
                                        )}"
                                        style="
                                            width:60px;
                                            height:60px;
                                            object-fit:contain;
                                            margin-bottom:8px;
                                        "
                                    >
                                `
                                : `
                                    <div style="
                                        font-size:40px;
                                        margin-bottom:8px;
                                    ">
                                        ⚽
                                    </div>
                                `
                            }

                            <h3 style="
                                margin:0;
                            ">
                                ${escapeFixtureHtml(
                                    awayTeam.name
                                )}
                            </h3>

                            <small>
                                ${escapeFixtureHtml(
                                    awayTeam.short_name || ""
                                )}
                            </small>

                        </div>

                    </div>


                    <div style="
                        margin-top:15px;
                        line-height:1.8;
                    ">

                        <p>
                            📅
                            <strong>
                                ${escapeFixtureHtml(
                                    formattedDate
                                )}
                            </strong>
                        </p>

                        <p>
                            ⏰
                            <strong>
                                ${escapeFixtureHtml(
                                    formattedTime
                                )}
                            </strong>
                        </p>

                        <p>
                            📍
                            <strong>
                                ${escapeFixtureHtml(
                                    fixture.venue ||
                                    "Venue TBA"
                                )}
                            </strong>
                        </p>

                        <p>
                            📢
                            <strong>
                                ${escapeFixtureHtml(
                                    fixture.status
                                )}
                            </strong>
                        </p>

                    </div>

                </div>

            `;


            fixturesContainer.appendChild(card);

        });


        // ========================================
        // IF ALL FIXTURES WERE FILTERED OUT
        // ========================================

        if (
            fixturesContainer.children.length === 0
        ) {

            fixturesContainer.innerHTML = `

                <div class="card" style="text-align:center;">

                    <h3>⚽ No Upcoming Fixtures</h3>

                    <p>
                        Fixtures will appear here once
                        approved teams are available.
                    </p>

                </div>

            `;
        }


    } catch (error) {

        console.error(
            "FIXTURE LOADING ERROR:",
            error
        );


        fixturesContainer.innerHTML = `

            <div class="card" style="text-align:center;">

                <h3>⚠️ Unable to Load Fixtures</h3>

                <p>
                    Please try refreshing the page.
                </p>

            </div>

        `;

    }

}


// ========================================
// ESCAPE FIXTURE HTML
// ========================================

function escapeFixtureHtml(value) {

    return String(value || "")

        .replace(/&/g, "&amp;")

        .replace(/</g, "&lt;")

        .replace(/>/g, "&gt;")

        .replace(/"/g, "&quot;")

        .replace(/'/g, "&#039;");
}
