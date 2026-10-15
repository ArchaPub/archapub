import type { Component } from 'svelte';
import IconCalendarPlus from '~icons/ph/calendar-plus';
import IconCalendarStar from '~icons/ph/calendar-star';
import IconEnvelope from '~icons/ph/envelope';
import IconFacebook from '~icons/ph/facebook-logo';
import IconForkKnife from '~icons/ph/fork-knife';
import IconInstagram from '~icons/ph/instagram-logo';
import IconLink from '~icons/ph/link';
import IconMapPin from '~icons/ph/map-pin';
import IconNewspaper from '~icons/ph/newspaper';
import IconPhone from '~icons/ph/phone';
import IconSpotify from '~icons/ph/spotify-logo';
import IconTiktok from '~icons/ph/tiktok-logo';
import IconX from '~icons/ph/x-logo';
import IconYoutube from '~icons/ph/youtube-logo';

/** Icons selectable in the CMS (see static/admin/config.yml); unknown names fall back to a link icon. */
const ICONS: Record<string, Component> = {
	instagram: IconInstagram,
	facebook: IconFacebook,
	tiktok: IconTiktok,
	youtube: IconYoutube,
	x: IconX,
	spotify: IconSpotify,
	'calendar-plus': IconCalendarPlus,
	'calendar-star': IconCalendarStar,
	'fork-knife': IconForkKnife,
	'map-pin': IconMapPin,
	phone: IconPhone,
	envelope: IconEnvelope,
	newspaper: IconNewspaper
};

export const iconFor = (name: string): Component => ICONS[name.replace(/-logo$/, '')] ?? IconLink;
