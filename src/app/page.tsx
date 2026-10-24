'use client'

import { SlotData } from "@/types";

import { Client} from "archipelago.js";
import { useCallback, useRef, useState } from "react";


export default function Home() {
  const clientRef = useRef<Client | null>(null);

  const [playerName, setPlayerName] = useState("");

  const [loadedPlayer, setLoadedPlayer] = useState<string | null>(null);
  const [, setSlotData] = useState<SlotData | null>(null);

  const [loadingPlayer, setLoadingPlayer] = useState<string | null>(null);
  const [loadPlayerError, setPlayerLoadError] = useState<string | null>(null);

  const [, setAllLocations] = useState<Set<number> | null>(null);
  const [checkedLocations, setCheckedLocations] = useState<Set<number> | null>(null);
  const [missingLocations, setMissingLocations] = useState<Set<number> | null>(null);

  const connect = useCallback(async () => {
    const cleanedPlayerName = playerName.trim();
    setPlayerLoadError(null);

    if (cleanedPlayerName === loadedPlayer) {
      return;
    }

    setLoadingPlayer(cleanedPlayerName);

    if (clientRef.current !== null) {
      clientRef.current.socket.disconnect();
    }

    clientRef.current = new Client();

    try {
      const slotData = await clientRef.current.login('ws://localhost:38281', cleanedPlayerName);
      setLoadedPlayer(cleanedPlayerName)
      setSlotData(slotData as SlotData);
      // console.log('Received slot data: ', slotData);
    }
    catch (error) {
        console.error('Received error!', error);
        setPlayerLoadError('' + error);
    }
    finally {
      setLoadingPlayer(null)
    }

    // console.log("dataPackage", clientRef.current.package.exportPackage());
    // console.log("allLocations", clientRef.current.room.allLocations);
    // console.log("checkedLocations", clientRef.current.room.checkedLocations);
    // console.log("missingLocations", clientRef.current.room.missingLocations);
    setAllLocations(new Set(clientRef.current.room.allLocations));
    setCheckedLocations(new Set(clientRef.current.room.checkedLocations));
    setMissingLocations(new Set(clientRef.current.room.missingLocations));

    clientRef.current.room.on(
      "locationsChecked",
      locationsChecked => {
        // console.log("locationsChecked", locationsChecked);
        setCheckedLocations(checkedLocations =>
          checkedLocations === null
          ? null
          : checkedLocations.union(new Set(locationsChecked)));
        setMissingLocations(missingLocations =>
          missingLocations === null
          ? null
          : missingLocations.difference(new Set(locationsChecked)));
      });

  }, [loadedPlayer, playerName]);

  return (
    <>
      <h1>Stardew Valley Archipelago Tracker</h1>
      <form
        onSubmit={e => {
          e.preventDefault();
          if (loadingPlayer === null) {
            connect();
          }
        }}>
        <label>Player Name: </label>
        <input
          type="text"
          value={playerName}
          onChange={e => setPlayerName(e.target.value)}
          disabled={loadingPlayer !== null}/>
        <button type="button" onClick={connect} disabled={loadingPlayer !== null}>Update Player</button>
      </form>
      {loadPlayerError !== null && <p>ERROR: {loadPlayerError}</p>}
      {loadedPlayer !== null && <p>Loaded player is <strong>{loadedPlayer}</strong></p>}
      {checkedLocations !== null && checkedLocations.size > 0 &&
        <>
          <h2>Completed Checks</h2>
          <ul>
            {[...checkedLocations].map(checkedLocation => <li key={checkedLocation}>{checkedLocation}</li>)}
          </ul>
        </>
      }
      {missingLocations !== null && missingLocations.size > 0 &&
        <>
          <h2>Missing Checks</h2>
          <ul>
            {[...missingLocations].map(missingLocation => <li key={missingLocation}>{missingLocation}</li>)}
          </ul>
        </>
      }
    </>
  );
}
