import { Client } from "archipelago.js";

const GAME = "Stardew Valley" as const;
const NAME_GROUP_KEY = `_read_location_name_groups_${GAME}` as const;

export type CheckData = {
  id: number,
  name: string,
  completed: boolean,
};

export enum CheckGroup {
  ROOM = "Community Center Room",
  BUNDLE = "Bundle",
  LEVEL = "Level",
  TOOL = "Tool",
  MINES = "Mines",
  MONSTERSANITY = "Monster Eradication",
  QUEST = "Quest",
  HELP_WANTED = "Help Wanted",
  SPECIAL_ORDER = "Special Order Board",
  FRIENDSHIP = "Friendship",
  FESTIVAL = "Festival",
  MUSEUM = "Museum",
  BLUEPRINT = "Blueprint",
  TRAVELING_MERCHANT = "Traveling Merchant",
  FISHSANITY = "Fishsanity",
  RACCOON = "Raccoon",
  TRASH_BEAR = "Trash Bear",
  CRAFT = "Craft",
  SECRET_NOTE = "Secret Note",
  SECRET = "Secret",
  ARCADE_MACHINE = "Arcade Machine",
  MOVIE = "Watch Movie",
  MOVIE_SNACK = "Eat Movie Snack",
  BOOKSANITY_LOST = "Lost Book",
  BOOKSANITY_POWER = "Power Book",
  BOOKSANITY_SKILL = "Skill Book",
  CROPSANITY = "Harvest Crop",
  SHIPSANITY_CROP = "Ship Crop",
  SHIPSANITY_FISH = "Ship Fish",
  SHIPSANITY = "Ship Other",
  CHEFSANITY = "Learn Cooking Recipe",
  COOKSANITY = "Cook",
  EATSANITY_ARTISAN = "Eatsanity Artisan",
  EATSANITY_COOKING = "Eatsanity Cooking",
  EATSANITY_CROP = "Eatsanity Crop",
  EATSANITY_FISH = "Eatsanity Fish",
  EATSANITY_POISONOUS = "Eatsanity Poisonous",
  EATSANITY_SHOP = "Eatsanity Shop",
  HATSANITY = "Hatsanity",
  SPECIAL_ORDER_QI = "Special Order Qi",
  WALNUT = "Walnut",
  WALNUT_PURCHASE = "Walnut Purchase",
  GINGER_ISLAND = "Ginger Island",
  SPOUSE = "Spouse",
  ENDGAME = "Endgame",
  OTHER = "Other",
};

export type OrderedGroup = {
  group: string,
  groupItems: CheckData[],
};

export type LevelSubItem = {
  id: number,
  levelName: string,
  completed: boolean,
};

export type Level = {
  skill: string,
  subItems: Map<string, LevelSubItem>,
};

export type LevelTable = {
  levelOptions: string[],
  levels: Level[],
}

export type MappedChecks = {
  level: LevelTable | null,
  other: OrderedGroup[],
};

export class StardewChecks {
  public client: Client;
  public allChecks: Map<number, string>;
  public completedChecks: Set<number>;
  public locationGroupMapping: Map<string, CheckGroup>;

  private constructor(
      client: Client,
      allChecks: Map<number, string>,
      completedChecks: Set<number>,
      locationGroupMapping: Map<string, CheckGroup>) {
    this.client = client;
    this.allChecks = allChecks;
    this.completedChecks = completedChecks;
    this.locationGroupMapping = locationGroupMapping;
  }

  public static async create(client: Client) {
    const locationNameGroups = await client.storage.fetchLocationNameGroups(GAME) as unknown as {[NAME_GROUP_KEY]: Record<string, string[]>};
    
    const locationToGroups = new Map<string, string[]>();
    for (const [group, locations] of Object.entries(locationNameGroups[NAME_GROUP_KEY])) {
      for (const location of locations) {
        let locationGroups = locationToGroups.get(location);
        if (locationGroups === undefined) {
          locationGroups = [];
          locationToGroups.set(location, locationGroups);
        }
        locationGroups.push(group);
      }
    }

    return new StardewChecks(
      client,
      new Map(
        client.room.allLocations.map(location => [
          location,
          client.package.lookupLocationName(GAME, location)])),
      new Set(client.room.checkedLocations),
      new Map(
        [...locationToGroups.entries()].map(([location, groups]) => [location, this.assignGroup(groups)])));
  }

  public addChecks(newChecks: Iterable<number>): StardewChecks {
    return new StardewChecks(
      this.client,
      this.allChecks,
      this.completedChecks.union(new Set(newChecks)),
      this.locationGroupMapping);
  }

  public static assignGroup(groupNames: Iterable<string>): CheckGroup {
    const groupSet = new Set(groupNames);
    if (groupSet.has("Booksanity Lost")) {
      return CheckGroup.BOOKSANITY_LOST;
    }
    if (groupSet.has("Booksanity Power")) {
      return CheckGroup.BOOKSANITY_POWER;
    }
    if (groupSet.has("Booksanity Skill")) {
      return CheckGroup.BOOKSANITY_SKILL
    }
    if (groupSet.has("Chefsanity")) {
      return CheckGroup.CHEFSANITY;
    }
    if (groupSet.has("Special Order Board")) {
      return CheckGroup.SPECIAL_ORDER;
    }
    if (groupSet.has("Hatsanity")) {
      return CheckGroup.HATSANITY;
    }
    if (groupSet.has("Eatsanity Artisan")) {
      return CheckGroup.EATSANITY_ARTISAN;
    }
    if (groupSet.has("Eatsanity Cooking")) {
      return CheckGroup.EATSANITY_COOKING;
    }
    if (groupSet.has("Eatsanity Crop")) {
      return CheckGroup.EATSANITY_CROP;
    }
    if (groupSet.has("Eatsanity Fish")) {
      return CheckGroup.EATSANITY_FISH;
    }
    if (groupSet.has("Eatsanity Poisonous")) {
      return CheckGroup.EATSANITY_POISONOUS;
    }
    if (groupSet.has("Eatsanity Shop")) {
      return CheckGroup.EATSANITY_SHOP;
    }
    if (groupSet.has("Endgame Locations")) {
      return CheckGroup.ENDGAME;
    }
    if (groupSet.has("Craftsanity")) {
      return CheckGroup.CRAFT;
    }
    if (groupSet.has("Cooksanity")) {
      return CheckGroup.COOKSANITY;
    }
    if (groupSet.has("Monstersanity")) {
      return CheckGroup.MONSTERSANITY;
    }
    if (groupSet.has("Shipsanity Crop")) {
      return CheckGroup.SHIPSANITY_CROP;
    }
    if (groupSet.has("Shipsanity Fish")) {
      return CheckGroup.SHIPSANITY_FISH;
    }
    if (groupSet.has("Shipsanity")) {
      return CheckGroup.SHIPSANITY;
    }
    if (groupSet.has("Cropsanity")) {
      return CheckGroup.CROPSANITY;
    }
    if (groupSet.has("Walnutsanity")) {
      return CheckGroup.WALNUT;
    }
    if (groupSet.has("Walnut Purchase")) {
      return CheckGroup.WALNUT_PURCHASE;
    }
    if (groupSet.has("Special Order Qi")) {
      return CheckGroup.SPECIAL_ORDER_QI;
    }
    if (groupSet.has("Festival")
        || groupSet.has("Festival Hard")
        || groupSet.has("Desert Festival Chef")
        || groupSet.has("Desert Festival Chef Meal")) {
      return CheckGroup.FESTIVAL;
    }
    if (groupSet.has("Friendsanity")) {
      return CheckGroup.FRIENDSHIP;
    }
    if (groupSet.has("Museum Donations") || groupSet.has("Museum Milestones")) {
      return CheckGroup.MUSEUM;
    }
    if (groupSet.has("Fishsanity")) {
      return CheckGroup.FISHSANITY;
    }
    if (groupSet.has("Help Wanted")) {
      return CheckGroup.HELP_WANTED;
    }
    if (groupSet.has("Secret Note")) {
      return CheckGroup.SECRET_NOTE;
    }
    if (groupSet.has("Secretsanity")) {
      return CheckGroup.SECRET;
    }
    if (groupSet.has("Traveling Merchant")) {
      return CheckGroup.TRAVELING_MERCHANT;
    }
    if (groupSet.has("Story Quest")) {
      return CheckGroup.QUEST;
    }
    if (groupSet.has("Building Blueprint")) {
      return CheckGroup.BLUEPRINT;
    }
    if (groupSet.has("Trash Bear")) {
      return CheckGroup.TRASH_BEAR;
    }
    if (groupSet.has("Skill Level")) {
      return CheckGroup.LEVEL;
    }
    if (groupSet.has("The Mines Treasure") ||groupSet.has("Elevator")) {
      return CheckGroup.MINES;
    }
    if (groupSet.has("Tool Upgrade") || groupSet.has("Backpack")) {
      return CheckGroup.TOOL;
    }
    if (groupSet.has("Community Center Room")) {
      return CheckGroup.ROOM;
    }
    if (groupSet.has("Raccoon Bundles")) {
      return CheckGroup.RACCOON;
    }
    if (groupSet.has("Bundle")) {
      return CheckGroup.BUNDLE;
    }
    if (groupSet.has("Movie Snack")) {
      return CheckGroup.MOVIE_SNACK;
    }
    if (groupSet.has("Any Movie") || groupSet.has("Movie")) {
      return CheckGroup.MOVIE;
    }
    if (groupSet.has("Arcade Machine") || groupSet.has("Arcade Machine Victory")) {
      return CheckGroup.ARCADE_MACHINE;
    }
    if (groupSet.has("Ginger Island")) {
      return CheckGroup.GINGER_ISLAND;
    }
    if (groupSet.has("Baby")) {
      return CheckGroup.GINGER_ISLAND;
    }
    return CheckGroup.OTHER;
  }

  public getGroupedChecks(): Map<CheckGroup, CheckData[]> {
    const groups = new Map<CheckGroup, CheckData[]>();

    for (const [checkId, checkName] of this.allChecks.entries()) {
      let assignedGroup = this.locationGroupMapping.get(checkName);
      if (assignedGroup === undefined) {
        console.error(`Couldn't find mapping for checkId=${checkId} checkName="${checkName}"`);
        assignedGroup = CheckGroup.OTHER;
      }

      let group = groups.get(assignedGroup);
      if (group === undefined) {
        group = [];
        groups.set(assignedGroup, group);
      }
      group.push({
        id: checkId,
        name: checkName,
        completed: this.completedChecks.has(checkId),
      })
    }

    return groups;
  }

  public getOrderedGroupedChecks(): OrderedGroup[]  {
    const checks = this.getGroupedChecks();

    return Object.values(CheckGroup)
      .map(group => ({group: group.toString(), groupItems: checks.get(group)}))
      .filter((group): group is OrderedGroup =>
          group.groupItems !== undefined);
  }

  private getLevelChecks(mappedChecks: OrderedGroup[]): LevelTable | null {
    const levelItems = mappedChecks.find(x => x.group === CheckGroup.LEVEL);
    if (levelItems === undefined) {
      return null;
    }
    else {
      const levelMapping = new Map<string, LevelSubItem[]>();
      for (const levelData of levelItems.groupItems) {
        let levelMatch = levelData.name.match(/(\w+) Mastery/);
        let level;
        let levelName;
        if (levelMatch !== null) {
          level = "Mastery";
          levelName = levelMatch[1];
        } else {
          levelMatch = levelData.name.match(/Level (\d{1,2}) (\w+)/);
          if (levelMatch === null) {
            console.error(`Couldn't parse level type from location id=${levelData.id} name=${levelData.name}`);
            level = `${levelData.name}-${levelData.id}`;
            levelName = `${levelData.name}-${levelData.id}`;
          } else {
            console.log("Level Match", levelMatch);
            level = levelMatch[1];
            levelName = levelMatch[2];
          }
        }

        let mappedLevels = levelMapping.get(levelName);
        if (mappedLevels === undefined) {
          mappedLevels = [];
          levelMapping.set(levelName, mappedLevels);
        }
        mappedLevels.push({
          id: levelData.id,
          levelName: level,
          completed: levelData.completed,
        })
      }

      return {
        levelOptions: [...new Set(levelMapping
            .values()
            .flatMap(levelSubItems => levelSubItems
              .map(levelSubItem => levelSubItem.levelName)))
          ].sort((a, b) => {
            const parsedA = +a;
            const parsedB = +b;
            if (isNaN(parsedA) && isNaN(parsedB)) {
              return a.localeCompare(b);
            }
            if (!isNaN(parsedA) && !isNaN(parsedB)) {
              return parsedA - parsedB;
            }
            if (isNaN(parsedA)) {
              return 1;
            }
            return -1;
          }),
        levels: [...levelMapping.keys()]
          .sort()
          .map(levelName => ({
            skill: levelName,
            subItems: new Map<string, LevelSubItem>(levelMapping
              .get(levelName)!
              .map(levelSubItem => [levelSubItem.levelName, levelSubItem])),
          })),
      };
    }
  }

  public getMappedChecks(): MappedChecks  {
    const mappedChecks = this.getOrderedGroupedChecks();

    return {
      level: this.getLevelChecks(mappedChecks),
      other: mappedChecks.filter(x => x.group !== CheckGroup.LEVEL),
    }
  }
}
