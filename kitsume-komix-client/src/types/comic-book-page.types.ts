export interface MetadataSectionField {
  key: string
  label: string
  maxVisible?: number
}

export interface MetadataSection {
  title: string
  fields: MetadataSectionField[]
}
