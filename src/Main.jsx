import React from 'react'
import { useEffect, useState } from 'react';
import { AddressZero } from "@ethersproject/constants";

export default function Main({ memberList, proposals, vote, hasClaimedNFT, address, token }) {
    const [isVoting, setIsVoting] = useState(false);
    const [hasVoted, setHasVoted] = useState(false);

    const shortenAddress = (str) => {
        return str.substring(0, 6) + "..." + str.substring(str.length - 4);
    };

    useEffect(() => {
        if (!hasClaimedNFT) return;
        // If we haven't finished retrieving the proposals from the useEffect above
        // then we can't check if the user voted yet!
        if (!proposals.length) return;

        const checkIfUserHasVoted = async () => {
            try {
                const hasVoted = await vote.hasVoted(proposals[0].proposalId, address);
                setHasVoted(hasVoted);
                if (hasVoted) {
                    console.log("🥵 User has already voted");
                } else {
                    console.log("🙂 User has not voted yet");
                }
            } catch (error) {
                console.error("Failed to check if wallet has voted", error);
            }
        };

        checkIfUserHasVoted();
    }, [hasClaimedNFT, proposals, address, vote]);

    const submitForm = async e => {
        e.preventDefault();
        e.stopPropagation();

        //before we do async things, we want to disable the button to prevent double clicks
        setIsVoting(true);

        const votes = proposals.map((proposal) => {
            const voteResult = {
                proposalId: proposal.proposalId,
                //abstain by default
                vote: 2
            };
            proposal.votes.forEach((vote) => {
                const elem = document.getElementById(proposal.proposalId + "-" + vote.type);
                if (elem.checked) {
                    voteResult.vote = vote.type;
                    return;
                }
            });
            return voteResult;
        });

        // first we need to make sure the user delegates their token to vote
        try {
            const delegation = await token.getDelegationOf(address);
            // if the delegation is the 0x0 address that means they have not delegated their governance tokens yet
            if (delegation === AddressZero) {
                await token.delegateTo(address);
            }
            // vote on the proposals
            try {
                await Promise.all(
                    votes.map(async ({ proposalId, vote: _vote }) => {
                        // check whether the proposal is open for voting
                        const proposal = await vote.get(proposalId);
                        if (proposal.state === 1) {
                            return vote.vote(proposalId, _vote);
                        }
                        return;
                    })
                );
                try {
                    // if any of the propsals are ready to be executed we'll need to execute them
                    await Promise.all(
                        votes.map(async ({ proposalId }) => {
                            // we'll first get the latest state of the proposal again, since we may have just voted before
                            const proposal = await vote.get(proposalId);
                            if (proposal.state === 4) {
                                return vote.execute(proposalId);
                            }
                        })
                    );
                    setHasVoted(true);
                    console.log("successfully voted");
                } catch (err) {
                    console.error("failed to execute votes", err);
                }
            } catch (err) {
                console.error("failed to vote", err);
            }
        } catch (err) {
            console.error("failed to delegate tokens");
        } finally {
            // in *either* case we need to set the isVoting state to false to enable the button again
            setIsVoting(false);
        }
    }

    return (
        <div className="member-page">
            <h1>Muay Thai 🍪DAO Member Page</h1>
            <p>Congratulations on being a member</p>
            <div>
                <div>
                    <h2>Member List</h2>
                    <table className="card">
                        <thead>
                            <tr>
                                <th>Address</th>
                                <th>Token Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {memberList.map((member) => {
                                return (
                                    <tr key={member.address}>
                                        <td>{shortenAddress(member.address)}</td>
                                        <td>{member.tokenAmount}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                <div>
                    <h2>Active Proposals</h2>
                    <form onSubmit={submitForm}>
                        {proposals.map((proposal) => (
                            <div key={proposal.proposalId} className="card">
                                <h5>{proposal.description}</h5>
                                <div>
                                    {proposal.votes.map(({ type, label }) => (
                                        <div key={type}>
                                            <input
                                                type="radio"
                                                id={proposal.proposalId + "-" + type}
                                                name={proposal.proposalId}
                                                value={type}
                                                //default the "abstain" vote to checked
                                                defaultChecked={type === 2}
                                            />
                                            <label htmlFor={proposal.proposalId + "-" + type}>
                                                {label}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                        <button disabled={isVoting || hasVoted} type="submit">
                            {isVoting ? "Voting..." : hasVoted ? "You Already Voted" : "Submit Votes"}
                        </button>
                        {!hasVoted && (
                            <small>
                                This will trigger multiple transactions that you will need to sign.
                            </small>
                        )}
                    </form>
                </div>
            </div>
        </div>
    )
}