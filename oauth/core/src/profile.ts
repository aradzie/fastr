export interface ResourceOwner {
  readonly provider: string;
  readonly id: string;
  readonly email: string | null;
  readonly name: string | null;
  readonly url: string | null;
  readonly imageUrl: string | null;
}
