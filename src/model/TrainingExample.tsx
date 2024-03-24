export interface TrainingExample {

    id?: string
    item1: string
    item2: string
    label: "before" | "after"
    supermarketId: string
}