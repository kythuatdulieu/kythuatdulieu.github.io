export const SITE_URL = 'https://kythuatdulieu.github.io';
export const SITE_NAME = 'Sổ tay Kỹ thuật Dữ liệu';
export const ORGANIZATION_NAME = 'Kỹ thuật Dữ liệu';
export const DEFAULT_DESCRIPTION =
	'Giải thích Data Engineering bằng tiếng Việt: hệ thống phân tán, ingestion, storage, batch, streaming, data modeling, DataOps, governance và GenAI.';
export const SITE_LOCALE = 'vi_VN';

export function toAbsoluteUrl(pathname = '/') {
	const url = new URL(pathname, SITE_URL);
	url.hash = '';
	url.search = '';
	return url.href;
}

export function toIsoDate(value) {
	if (!value) return undefined;

	const date = value instanceof Date ? value : new Date(value);
	return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}
