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

    // ----------------------------------------
    // Add a player
    // ----------------------------------------
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

            <button
                type="button"
                class="remove-player"
            >
                Remove
            </button>
        `;

        player.querySelector(".remove-player").addEventListener(
            "click",
            () => {

                player.remove();

                updatePlayerNumbers();

            }
        );

        playersContainer.appendChild(player);

        updatePlayerNumbers();
    }

    // ----------------------------------------
    // Update player numbers
    // ----------------------------------------
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
            addPlayerBtn.textContent = "Maximum 20 Players";

        } else {

            addPlayerBtn.disabled = false;
            addPlayerBtn.textContent = "+ Add Player";

        }
    }

    // ----------------------------------------
    // Add first player automatically
    // ----------------------------------------
    addPlayer();

    addPlayerBtn.addEventListener(
        "click",
        addPlayer
    );

    // ----------------------------------------
    // Submit registration
    // ----------------------------------------
    form.addEventListener("submit", async (event) => {

        event.preventDefault();

        message.innerHTML =
            "<p>Submitting registration...</p>";

        message.className =
            "registration-message loading";

        const submitButton =
            form.querySelector("button[type='submit']");

        submitButton.disabled = true;

        try {

            // --------------------------------
            // Collect team information
            // --------------------------------

            const team = {

                name:
                    document.getElementById("teamName").value.trim(),

                short_name:
                    document.getElementById("shortName").value.trim(),

                location:
                    document.getElementById("teamLocation").value.trim(),

                coach_name:
                    document.getElementById("coachName").value.trim(),

                captain_name:
                    document.getElementById("captainName").value.trim(),

                vice_captain_name:
                    document.getElementById("viceCaptainName").value.trim(),

                discipline_master_name:
                    document.getElementById("disciplineMasterName").value.trim(),

                phone:
                    document.getElementById("teamPhone").value.trim(),

                email:
                    document.getElementById("teamEmail").value.trim(),

                registration_status:
                    "Pending"
            };

            // --------------------------------
            // Collect players
            // --------------------------------

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

                players.push({

                    full_name:
                        row.querySelector(
                            'input[name="player_name"]'
                        ).value.trim(),

                    jersey_number:
                        parseInt(
                            row.querySelector(
                                'input[name="jersey_number"]'
                            ).value
                        ),

                    position:
                        row.querySelector(
                            'select[name="position"]'
                        ).value,

                    registration_status:
                        "Pending"
                });

            });

            // --------------------------------
            // Check duplicate jersey numbers
            // --------------------------------

            const jerseyNumbers =
                players.map(player => player.jersey_number);

            const uniqueNumbers =
                new Set(jerseyNumbers);

            if (uniqueNumbers.size !== jerseyNumbers.length) {

                throw new Error(
                    "Each player must have a different jersey number."
                );

            }

            // --------------------------------
            // Insert team
            // --------------------------------

            const {
                data: teamData,
                error: teamError
            } = await supabaseClient
                .from("teams")
                .insert(team)
                .select("id")
                .single();

            if (teamError) {

                throw teamError;

            }

            const teamId = teamData.id;

            // --------------------------------
            // Add team ID to players
            // --------------------------------

            const playersWithTeam =
                players.map(player => ({
                    ...player,
                    team_id: teamId
                }));

            // --------------------------------
            // Insert players
            // --------------------------------

            const {
                error: playersError
            } = await supabaseClient
                .from("players")
                .insert(playersWithTeam);

            if (playersError) {

                // Try to remove the team if player
                // insertion failed
                await supabaseClient
                    .from("teams")
                    .delete()
                    .eq("id", teamId);

                throw playersError;

            }

            // --------------------------------
            // SUCCESS
            // --------------------------------

            message.className =
                "registration-message success";

            message.innerHTML = `
                <h3>✅ Registration Submitted!</h3>

                <p>
                    <strong>${escapeHtml(team.name)}</strong>
                    has been successfully submitted.
                </p>

                <p>
                    Your team and ${players.length} player(s)
                    are currently <strong>Pending Approval</strong>.
                </p>

                <p>
                    The Kabaru Ward Football administrator
                    will review the registration.
                </p>
            `;

            form.reset();

            playersContainer.innerHTML = "";

            playerNumber = 0;

            addPlayer();

            window.scrollTo({
                top: message.offsetTop - 100,
                behavior: "smooth"
            });

        } catch (error) {

            console.error(error);

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

    // ----------------------------------------
    // Basic HTML escaping
    // ----------------------------------------

    function escapeHtml(value) {

        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    }

});
