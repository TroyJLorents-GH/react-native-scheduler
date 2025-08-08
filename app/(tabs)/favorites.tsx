import SmartListScreen from "@/components/SmartListScreen";

export default function FavoritesTab(){
    return (
        <SmartListScreen
            title="Favorites"
            filter={todo => todo.favorite && !todo.done}
        />
    );
}