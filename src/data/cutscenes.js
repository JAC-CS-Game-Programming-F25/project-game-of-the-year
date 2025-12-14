/**
 * Cutscene data for the game.
 * Each cutscene has an image and dialogue lines.
 */

export const cutsceneData = {
	// Opening cutscene (before starting zone)
	opening: {
		id: 'cutscene-0',
		dialogue: [
			"You were once a legendary warrior, feared across the realm...",
			"During your final battle, a forbidden ritual tore your spirit from your body.",
			"Your soul didn't pass on. It mutated into a Shadow Form—a broken, half-forgotten being.",
			"Now you drift through this cursed temple, seeking to reclaim what was stolen.",
			"The guardians who were once your allies now stand corrupted, twisted by the same dark magic.",
			"To regain your humanity, you must defeat them all."
		]
	},
	
	// After Starting_map
	afterStarting: {
		id: 'cutscene-1',
		dialogue: [
			"These creatures… they weren't meant to exist inside the temple.",
			"Their forms… twisted, hollow. Just like mine.",
			"If even the lesser spirits have fallen to corruption…",
			"Then the deeper chambers must hold far worse.",
			"I can sense something… familiar. A presence waiting ahead.",
			"If I want answers… I have to keep moving."
		]
	},
	
	// After map1
	afterMap1: {
		id: 'cutscene-2',
		dialogue: [
			"That creature… it fought with discipline.",
			"Those movements… they weren't instinct or corruption.",
			"It remembered techniques. Footwork. Strikes.",
			"These were once temple disciples — warriors, protectors.",
			"If they've fallen this far… what happened to the others?",
			"Did I train beside them? Did they know me?",
			"My memories are still fragments… but something in that fight felt familiar.",
			"I must keep going. The truth is buried deeper… with the strongest among them.",
			"If corruption can twist even the disciplined… then what has it done to me?"
		]
	},
	
	// After GoodMap
	afterGoodMap: {
		id: 'cutscene-3',
		dialogue: [
			"The further I go, the stronger the echoes become…",
			"These walls remember battles… rituals… betrayal.",
			"The corruption isn't just consuming the guardians.",
			"It's woven into the stone… the air… even me.",
			"Someone — or something — is feeding it.",
			"A presence waits ahead… watching… preparing.",
			"Whatever lies deeper in this temple… it knows I'm coming.",
			"And it's not afraid of me. It's expecting me."
		]
	},
	
	// After map2
	afterMap2: {
		id: 'cutscene-4',
		dialogue: [
			"There it is again… that presence.",
			"The corruption doesn't spread randomly. It radiates from a single source.",
			"One Guardian remains… the strongest of them all.",
			"I remember its voice. Its oath. Its loyalty.",
			"If the ritual twisted even that warrior…",
			"…then this temple is more cursed than I feared.",
			"I must keep moving. Every step brings me closer—to the truth… and to the Guardian."
		]
	},
	
	// After terrainMapTiled (before boss)
	beforeBoss: {
		id: 'cutscene-5',
		dialogue: [
			"…I know this aura. He's been waiting for me… suffering because of me.",
			"The Guardian wasn't just a protector. He was my closest companion… bound to me by oath and blood.",
			"When the ritual tore my spirit apart… he tried to save me. It was his hands that pulled me from the void—until the magic consumed him too.",
			"Now he stands alone at the heart of this temple… a monster shaped by the same curse that stole my name.",
			"He deserved to be remembered as a hero. Instead, he became my jailor.",
			"If I go through those doors… I'll be the one to end the life he tried to save.",
			"I cannot undo what I've done. But I can free him from what I've made him become.",
			"Forgive me, old friend… This time, I won't fail you."
		]
	},
	
	// After defeating Temple Guardian
	postVictory: {
		id: 'post-victory-cutscene',
		dialogue: [
			"You fought to protect this temple… even as the corruption devoured you.",
			"I could not save you.",
			"All I can offer you now… is peace."
		]
	},
	
	// Victory screen
	victory: {
		id: 'victory-scene',
		dialogue: []
	}
};

/**
 * Get cutscene data by ID
 */
export function getCutscene(cutsceneId) {
	return cutsceneData[cutsceneId] || null;
}

